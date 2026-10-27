const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const DoctorSchedule = require('../models/DoctorSchedule');
const { getDoctorQueue } = require('../services/tokenService');
const { logActivity } = require('../utils/activityLogger');

/**
 * List doctors with optional department and availability filter
 */
const getDoctors = async (req, res, next) => {
  try {
    const { departmentId, isAvailable, search } = req.query;
    const filter = {};

    if (departmentId) filter.departmentId = departmentId;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    let query = Doctor.find(filter)
      .populate('userId', 'fullName email phone isActive')
      .populate('departmentId', 'name departmentCode');

    const doctors = await query;

    // Optional name search filter
    let filtered = doctors;
    if (search) {
      const s = search.toLowerCase();
      filtered = doctors.filter(
        (d) =>
          d.userId?.fullName?.toLowerCase().includes(s) ||
          d.specialization?.toLowerCase().includes(s) ||
          d.departmentId?.name?.toLowerCase().includes(s)
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor by ID
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'fullName email phone isActive')
      .populate('departmentId', 'name departmentCode dailyTokenLimit');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor profile (Admin or the Doctor themselves)
 */
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Authorization check: Must be admin or the doctor themselves
    if (
      req.user.role !== 'admin' &&
      String(doctor.userId) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this doctor profile'
      });
    }

    const {
      specialization,
      qualifications,
      consultationDurationMinutes,
      availability,
      isAvailable,
      roomNumber,
      bio,
      departmentId
    } = req.body;

    if (specialization) doctor.specialization = specialization;
    if (qualifications) doctor.qualifications = qualifications;
    if (consultationDurationMinutes)
      doctor.consultationDurationMinutes = Number(consultationDurationMinutes);
    if (availability) doctor.availability = availability;
    if (isAvailable !== undefined) doctor.isAvailable = Boolean(isAvailable);
    if (roomNumber) doctor.roomNumber = roomNumber;
    if (bio !== undefined) doctor.bio = bio;

    // Only admin can reassign department
    if (departmentId && req.user.role === 'admin') {
      doctor.departmentId = departmentId;
    }

    await doctor.save();

    await logActivity({
      req,
      action: 'DOCTOR_UPDATED',
      resourceType: 'Doctor',
      resourceId: doctor._id
    });

    res.json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor's appointments
 */
const getDoctorAppointments = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const { date, status } = req.query;

    const filter = { doctorId };
    if (date) filter.appointmentDate = date;
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'fullName email phone' }
      })
      .populate('tokenId');

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor's live queue
 */
const getDoctorQueueHandler = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const { date } = req.query;

    const queueData = await getDoctorQueue(doctorId, date);
    res.json({
      success: true,
      data: queueData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor weekly schedule
 */
const getDoctorSchedule = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const schedules = await DoctorSchedule.find({ doctorId }).sort({ dayOfWeek: 1 });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Save / Update doctor weekly schedule (Admin or Doctor)
 */
const updateDoctorSchedule = async (req, res, next) => {
  try {
    const doctorId = req.params.id;
    const { schedules } = req.body; // Array of { dayOfWeek, startTime, endTime, breakPeriods, slotDurationMinutes, maximumAppointments, isActive }

    if (!Array.isArray(schedules)) {
      return res.status(400).json({
        success: false,
        message: 'schedules must be an array of daily schedules.'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Role check
    if (req.user.role !== 'admin' && String(doctor.userId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this schedule'
      });
    }

    const updated = [];
    for (const item of schedules) {
      const doc = await DoctorSchedule.findOneAndUpdate(
        { doctorId, dayOfWeek: item.dayOfWeek },
        {
          startTime: item.startTime || '09:00',
          endTime: item.endTime || '17:00',
          breakPeriods: item.breakPeriods || [{ start: '13:00', end: '14:00' }],
          slotDurationMinutes: item.slotDurationMinutes || doctor.consultationDurationMinutes || 15,
          maximumAppointments: item.maximumAppointments || 30,
          isActive: item.isActive !== undefined ? item.isActive : true
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      updated.push(doc);
    }

    await logActivity({
      req,
      action: 'DOCTOR_SCHEDULE_UPDATED',
      resourceType: 'DoctorSchedule',
      resourceId: doctorId
    });

    res.json({
      success: true,
      message: 'Doctor schedule updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctor,
  getDoctorAppointments,
  getDoctorQueueHandler,
  getDoctorSchedule,
  updateDoctorSchedule
};
