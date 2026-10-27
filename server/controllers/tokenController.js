const Token = require('../models/Token');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const {
  generateSequentialToken,
  updateTokenStatus,
  calculateQueuePosition,
  getDepartmentQueue
} = require('../services/tokenService');
const { logActivity } = require('../utils/activityLogger');

/**
 * Get token by ID with dynamic queue position & wait time
 */
const getTokenById = async (req, res, next) => {
  try {
    const token = await Token.findById(req.params.id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'fullName email phone' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .populate('departmentId', 'name departmentCode dailyTokenLimit')
      .populate('appointmentId');

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found'
      });
    }

    const positionInfo = await calculateQueuePosition(token._id);

    res.json({
      success: true,
      data: {
        ...token.toObject(),
        positionInfo
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get tokens belonging to current logged-in patient
 */
const getMyTokens = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const tokens = await Token.find({ patientId: patient._id })
      .sort({ createdAt: -1 })
      .populate('departmentId', 'name departmentCode')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .populate('appointmentId');

    const enriched = await Promise.all(
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
      count: enriched.length,
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get live queue for a department
 */
const getDepartmentQueueHandler = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { date } = req.query;

    const queue = await getDepartmentQueue(departmentId, date);

    res.json({
      success: true,
      departmentId,
      date: date || new Date().toISOString().split('T')[0],
      count: queue.length,
      data: queue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Direct token generation (receptionist walk-in or manual issue)
 */
const issueToken = async (req, res, next) => {
  try {
    const { patientId, doctorId, departmentId, appointmentDate, priority, notes } = req.body;

    if (!patientId || !doctorId || !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'patientId, doctorId, and departmentId are required.'
      });
    }

    const serviceDate = appointmentDate || new Date().toISOString().split('T')[0];

    // Create a walk-in appointment record first
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      departmentId,
      appointmentDate: serviceDate,
      appointmentTime: new Date().toTimeString().substring(0, 5),
      appointmentType: 'ROUTINE',
      bookingSource: 'RECEPTIONIST_WALK_IN',
      status: 'BOOKED',
      reasonForVisit: notes || 'Walk-in consultation'
    });

    const token = await generateSequentialToken({
      appointmentId: appointment._id,
      patientId,
      doctorId,
      departmentId,
      serviceDate,
      priority: Boolean(priority)
    });

    await logActivity({
      req,
      action: 'TOKEN_ISSUED_MANUAL',
      resourceType: 'Token',
      resourceId: token._id,
      metadata: { tokenNumber: token.tokenNumber, serviceDate }
    });

    res.status(201).json({
      success: true,
      message: 'Token issued successfully',
      data: token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor / Receptionist calls token
 */
const callToken = async (req, res, next) => {
  try {
    const token = await updateTokenStatus(req.params.id, 'CALLED');

    await logActivity({
      req,
      action: 'TOKEN_CALLED',
      resourceType: 'Token',
      resourceId: token._id,
      metadata: { tokenNumber: token.tokenNumber }
    });

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} has been called`,
      data: token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor starts consultation
 */
const startConsultation = async (req, res, next) => {
  try {
    const token = await updateTokenStatus(req.params.id, 'IN_CONSULTATION');

    await logActivity({
      req,
      action: 'TOKEN_CONSULTATION_STARTED',
      resourceType: 'Token',
      resourceId: token._id,
      metadata: { tokenNumber: token.tokenNumber }
    });

    res.json({
      success: true,
      message: `Consultation started for token ${token.tokenNumber}`,
      data: token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor marks consultation as completed
 */
const completeToken = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const token = await updateTokenStatus(req.params.id, 'COMPLETED', { notes });

    await logActivity({
      req,
      action: 'TOKEN_COMPLETED',
      resourceType: 'Token',
      resourceId: token._id,
      metadata: { tokenNumber: token.tokenNumber }
    });

    res.json({
      success: true,
      message: `Consultation completed for token ${token.tokenNumber}`,
      data: token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor skips token
 */
const skipToken = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const token = await updateTokenStatus(req.params.id, 'SKIPPED', { notes });

    await logActivity({
      req,
      action: 'TOKEN_SKIPPED',
      resourceType: 'Token',
      resourceId: token._id,
      metadata: { tokenNumber: token.tokenNumber }
    });

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} has been marked as skipped`,
      data: token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor / Receptionist recalls a skipped patient
 */
const recallToken = async (req, res, next) => {
  try {
    const token = await updateTokenStatus(req.params.id, 'CALLED');

    await logActivity({
      req,
      action: 'TOKEN_RECALLED',
      resourceType: 'Token',
      resourceId: token._id,
      metadata: { tokenNumber: token.tokenNumber }
    });

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} has been recalled`,
      data: token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel token
 */
const cancelTokenHandler = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const token = await updateTokenStatus(req.params.id, 'CANCELLED', { reason });

    await logActivity({
      req,
      action: 'TOKEN_CANCELLED',
      resourceType: 'Token',
      resourceId: token._id,
      metadata: { tokenNumber: token.tokenNumber, reason }
    });

    res.json({
      success: true,
      message: `Token ${token.tokenNumber} has been cancelled`,
      data: token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTokenById,
  getMyTokens,
  getDepartmentQueueHandler,
  issueToken,
  callToken,
  startConsultation,
  completeToken,
  skipToken,
  recallToken,
  cancelTokenHandler
};
