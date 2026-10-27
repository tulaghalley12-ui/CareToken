const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Token = require('../models/Token');
const bcrypt = require('bcryptjs');
const { calculateQueuePosition } = require('../services/tokenService');
const { logActivity } = require('../utils/activityLogger');

/**
 * List patients (Admin, Receptionist, Doctor)
 */
const getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;

    const patients = await Patient.find()
      .populate('userId', 'fullName email phone isActive')
      .sort({ createdAt: -1 });

    let filtered = patients;
    if (search) {
      const s = search.toLowerCase();
      filtered = patients.filter(
        (p) =>
          p.patientNumber.toLowerCase().includes(s) ||
          p.userId?.fullName?.toLowerCase().includes(s) ||
          p.userId?.phone?.includes(s) ||
          p.userId?.email?.toLowerCase().includes(s)
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
 * Get patient by ID
 */
const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id).populate(
      'userId',
      'fullName email phone isActive'
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Role check: Only the patient themselves, or staff (admin, receptionist, doctor) can view
    if (
      req.user.role === 'patient' &&
      String(patient.userId?._id) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this patient record'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register walk-in patient by receptionist or admin
 */
const createPatient = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      bloodGroup,
      emergencyContact
    } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name and phone number are required for walk-in patient registration.'
      });
    }

    // Construct a placeholder or real email
    const safeEmail = email
      ? email.toLowerCase()
      : `walkin.${Date.now()}.${Math.floor(Math.random() * 1000)}@hospital.local`;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('WalkIn@1234', salt);

    const user = await User.create({
      fullName,
      email: safeEmail,
      phone,
      passwordHash,
      role: 'patient'
    });

    const patientCount = await Patient.countDocuments();
    const patientNumber = `PAT-${String(patientCount + 10001)}`;

    const patient = await Patient.create({
      userId: user._id,
      patientNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || 'prefer_not_to_say',
      address: address || {},
      bloodGroup: bloodGroup || 'Unknown',
      emergencyContact: emergencyContact || {}
    });

    await logActivity({
      req,
      action: 'WALKIN_PATIENT_REGISTERED',
      resourceType: 'Patient',
      resourceId: patient._id
    });

    res.status(201).json({
      success: true,
      message: 'Walk-in patient registered successfully',
      data: {
        _id: patient._id,
        patientNumber: patient.patientNumber,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient profile
 */
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (
      req.user.role === 'patient' &&
      String(patient.userId) !== String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to update this patient record'
      });
    }

    const {
      fullName,
      phone,
      dateOfBirth,
      gender,
      address,
      bloodGroup,
      emergencyContact
    } = req.body;

    if (dateOfBirth) patient.dateOfBirth = new Date(dateOfBirth);
    if (gender) patient.gender = gender;
    if (address) patient.address = { ...patient.address, ...address };
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (emergencyContact)
      patient.emergencyContact = { ...patient.emergencyContact, ...emergencyContact };

    await patient.save();

    // If user fields were provided
    if (fullName || phone) {
      const user = await User.findById(patient.userId);
      if (user) {
        if (fullName) user.fullName = fullName;
        if (phone) user.phone = phone;
        await user.save();
      }
    }

    await logActivity({
      req,
      action: 'PATIENT_UPDATED',
      resourceType: 'Patient',
      resourceId: patient._id
    });

    res.json({
      success: true,
      message: 'Patient profile updated successfully',
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient's appointments
 */
const getPatientAppointments = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const appointments = await Appointment.find({ patientId })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .populate('departmentId', 'name departmentCode')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
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
 * Get patient's tokens with dynamic queue positions
 */
const getPatientTokens = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const tokens = await Token.find({ patientId })
      .sort({ createdAt: -1 })
      .populate('departmentId', 'name departmentCode')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      });

    const enrichedTokens = await Promise.all(
      tokens.map(async (t) => {
        const positionInfo = await calculateQueuePosition(t._id);
        return {
          ...t.toObject(),
          positionInfo
        };
      })
    );

    res.json({
      success: true,
      count: enrichedTokens.length,
      data: enrichedTokens
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  getPatientAppointments,
  getPatientTokens
};
