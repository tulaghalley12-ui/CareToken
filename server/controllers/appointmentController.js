const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const {
  createAppointment,
  cancelAppointment,
  getAvailableSlots
} = require('../services/appointmentService');
const { logActivity } = require('../utils/activityLogger');

/**
 * Get available time slots for booking
 */
const getAvailableSlotsHandler = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Both doctorId and date (YYYY-MM-DD) query parameters are required.'
      });
    }

    const slotsData = await getAvailableSlots(doctorId, date);
    res.json({
      success: true,
      data: slotsData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Book a new appointment
 */
const bookAppointment = async (req, res, next) => {
  try {
    let {
      patientId,
      doctorId,
      departmentId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      reasonForVisit,
      priority
    } = req.body;

    // If caller is patient, auto-resolve their patientId
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) {
        return res.status(400).json({
          success: false,
          message: 'Patient profile not found for current user.'
        });
      }
      patientId = patient._id;
    }

    if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'patientId, doctorId, appointmentDate, and appointmentTime are required.'
      });
    }

    const bookingSource =
      req.user.role === 'patient' ? 'ONLINE_PATIENT' : 'RECEPTIONIST_WALK_IN';

    const result = await createAppointment({
      patientId,
      doctorId,
      departmentId,
      appointmentDate,
      appointmentTime,
      appointmentType,
      bookingSource,
      reasonForVisit,
      priority: req.user.role === 'receptionist' || req.user.role === 'admin' ? Boolean(priority) : false
    });

    await logActivity({
      req,
      action: 'APPOINTMENT_BOOKED',
      resourceType: 'Appointment',
      resourceId: result.appointment._id,
      metadata: {
        appointmentDate,
        appointmentTime,
        tokenNumber: result.token?.tokenNumber
      }
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked and token issued successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List appointments with role-scoped filters
 */
const getAppointments = async (req, res, next) => {
  try {
    const { date, doctorId, departmentId, status, patientId } = req.query;
    const filter = {};

    if (date) filter.appointmentDate = date;
    if (doctorId) filter.doctorId = doctorId;
    if (departmentId) filter.departmentId = departmentId;
    if (status) filter.status = status;

    // Scope based on role
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.json({ success: true, count: 0, data: [] });
      filter.patientId = patient._id;
    } else if (patientId) {
      filter.patientId = patientId;
    }

    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'fullName email phone' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .populate('departmentId', 'name departmentCode')
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
 * Get appointment by ID
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'fullName email phone' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .populate('departmentId', 'name departmentCode')
      .populate('tokenId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Role check
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient || String(appointment.patientId._id) !== String(patient._id)) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized access to this appointment'
        });
      }
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment
 */
const cancelAppointmentHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await cancelAppointment(id, reason, req.user);

    await logActivity({
      req,
      action: 'APPOINTMENT_CANCELLED',
      resourceType: 'Appointment',
      resourceId: appointment._id,
      metadata: { reason }
    });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableSlotsHandler,
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointmentHandler
};
