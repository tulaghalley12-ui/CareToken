const Token = require('../models/Token');
const TokenSequence = require('../models/TokenSequence');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { emitQueueUpdate, emitNotification } = require('../sockets/queueSocket');

/**
 * Valid state transitions map
 */
const VALID_TRANSITIONS = {
  BOOKED: ['WAITING', 'CANCELLED'],
  WAITING: ['CALLED', 'SKIPPED', 'CANCELLED', 'NO_SHOW'],
  CALLED: ['IN_CONSULTATION', 'SKIPPED', 'WAITING', 'CANCELLED', 'NO_SHOW'],
  IN_CONSULTATION: ['COMPLETED', 'CANCELLED'],
  SKIPPED: ['WAITING', 'CALLED', 'CANCELLED', 'NO_SHOW'],
  COMPLETED: [], // Terminal
  CANCELLED: [], // Terminal
  NO_SHOW: ['WAITING', 'CANCELLED'] // Can be re-queued by receptionist if patient arrives late
};

/**
 * Atomically generates a sequential token for a department and service date
 */
const generateSequentialToken = async ({
  appointmentId,
  patientId,
  doctorId,
  departmentId,
  serviceDate,
  priority = false
}) => {
  // Check if an active token already exists for this appointment
  const existingToken = await Token.findOne({ appointmentId });
  if (existingToken) {
    if (existingToken.queueStatus !== 'CANCELLED') {
      const error = new Error('An active token already exists for this appointment');
      error.statusCode = 409;
      throw error;
    }
  }

  // Get department to retrieve code and verify token limits
  const department = await Department.findById(departmentId);
  if (!department) {
    const error = new Error('Department not found');
    error.statusCode = 404;
    throw error;
  }

  const deptCode = (department.departmentCode || 'GEN').toUpperCase();

  // Atomic increment in TokenSequence per department code and serviceDate
  const sequenceDoc = await TokenSequence.findOneAndUpdate(
    { departmentCode: deptCode, serviceDate },
    { $inc: { lastSequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const nextSeq = sequenceDoc.lastSequence;

  // Enforce department daily token limit if applicable
  if (department.dailyTokenLimit && nextSeq > department.dailyTokenLimit) {
    // Note: Do not decrement atomic sequence to maintain monotonically increasing gaps
    const error = new Error(
      `Daily token limit of ${department.dailyTokenLimit} reached for department ${department.name} on ${serviceDate}`
    );
    error.statusCode = 429;
    throw error;
  }

  // Format token number: e.g. CARD-001, CARD-002
  const tokenNumber = `${deptCode}-${String(nextSeq).padStart(3, '0')}`;

  const token = await Token.create({
    tokenNumber,
    tokenSequence: nextSeq,
    patientId,
    doctorId,
    departmentId,
    appointmentId,
    serviceDate,
    queueStatus: 'WAITING',
    priority,
    issuedAt: new Date()
  });

  // Link token to appointment
  await Appointment.findByIdAndUpdate(appointmentId, {
    tokenId: token._id,
    status: 'CONFIRMED'
  });

  return token;
};

/**
 * Validates whether transition from current status to next status is legal
 */
const validateStatusTransition = (currentStatus, newStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    const error = new Error(
      `Invalid token status transition from '${currentStatus}' to '${newStatus}'. Allowed: [${allowed.join(
        ', '
      )}]`
    );
    error.statusCode = 400;
    throw error;
  }
};

/**
 * Calculates current dynamic queue position and estimated wait time for a token
 */
const calculateQueuePosition = async (tokenId) => {
  const token = await Token.findById(tokenId).populate('doctorId departmentId');
  if (!token) return null;

  if (['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(token.queueStatus)) {
    return {
      queuePosition: 0,
      estimatedWaitMinutes: 0,
      eligibleWaitingAhead: 0,
      isNext: false,
      isCurrentlyConsulting: false
    };
  }

  if (token.queueStatus === 'IN_CONSULTATION') {
    return {
      queuePosition: 0,
      estimatedWaitMinutes: 0,
      eligibleWaitingAhead: 0,
      isNext: false,
      isCurrentlyConsulting: true
    };
  }

  if (token.queueStatus === 'CALLED') {
    return {
      queuePosition: 1,
      estimatedWaitMinutes: 0,
      eligibleWaitingAhead: 0,
      isNext: true,
      isCurrentlyConsulting: false
    };
  }

  // Count active tokens ahead in queue for the same doctor and service date with status WAITING
  // Patients with lower tokenSequence who are WAITING or CALLED
  const tokensAhead = await Token.countDocuments({
    doctorId: token.doctorId._id || token.doctorId,
    serviceDate: token.serviceDate,
    queueStatus: { $in: ['WAITING', 'CALLED'] },
    tokenSequence: { $lt: token.tokenSequence }
  });

  // Check if someone is currently in consultation
  const currentlyConsulting = await Token.findOne({
    doctorId: token.doctorId._id || token.doctorId,
    serviceDate: token.serviceDate,
    queueStatus: 'IN_CONSULTATION'
  });

  const avgConsultDuration =
    token.doctorId?.consultationDurationMinutes || 15;

  // Queue position: 1-indexed. If tokensAhead == 0, position is 1 (next in line)
  const queuePosition = tokensAhead + 1;

  // Estimated wait minutes = (tokensAhead * avgDuration) + (consulting buffer)
  const consultingBuffer = currentlyConsulting ? Math.round(avgConsultDuration / 2) : 0;
  const estimatedWaitMinutes = tokensAhead * avgConsultDuration + consultingBuffer;

  return {
    queuePosition,
    estimatedWaitMinutes,
    eligibleWaitingAhead: tokensAhead,
    isNext: queuePosition === 1,
    isCurrentlyConsulting: false
  };
};

/**
 * Updates token status with state machine enforcement and socket dispatch
 */
const updateTokenStatus = async (tokenId, newStatus, extraData = {}) => {
  const token = await Token.findById(tokenId)
    .populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'fullName email phone' }
    })
    .populate('departmentId', 'name departmentCode')
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'fullName' }
    });

  if (!token) {
    const error = new Error('Token not found');
    error.statusCode = 404;
    throw error;
  }

  validateStatusTransition(token.queueStatus, newStatus);

  const prevStatus = token.queueStatus;
  token.queueStatus = newStatus;

  const now = new Date();
  if (newStatus === 'CALLED') token.calledAt = now;
  if (newStatus === 'IN_CONSULTATION') token.consultationStartedAt = now;
  if (newStatus === 'COMPLETED') token.completedAt = now;
  if (newStatus === 'CANCELLED') token.cancelledAt = now;
  if (newStatus === 'SKIPPED') token.skippedAt = now;

  if (extraData.notes) token.notes = extraData.notes;

  await token.save();

  // If completed or cancelled, sync appointment status
  if (newStatus === 'COMPLETED') {
    await Appointment.findByIdAndUpdate(token.appointmentId, { status: 'COMPLETED' });
  } else if (newStatus === 'CANCELLED') {
    await Appointment.findByIdAndUpdate(token.appointmentId, {
      status: 'CANCELLED',
      cancellationReason: extraData.reason || 'Token cancelled'
    });
  }

  // Create patient notification if status changed to CALLED, IN_CONSULTATION, SKIPPED, COMPLETED
  const patientUserId = token.patientId?.userId?._id;
  if (patientUserId) {
    let title = `Token ${token.tokenNumber} Update`;
    let message = `Your token status is now: ${newStatus}`;
    let notifType = 'TOKEN_STATUS';

    if (newStatus === 'CALLED') {
      title = `Your Token ${token.tokenNumber} is Called!`;
      message = `Please proceed to Doctor ${
        token.doctorId?.userId?.fullName || ''
      }'s room (${token.doctorId?.roomNumber || 'Consultation room'}).`;
      notifType = 'TOKEN_CALLED';
    } else if (newStatus === 'SKIPPED') {
      title = `Token ${token.tokenNumber} Skipped`;
      message = `Your token was temporarily skipped. Please contact the reception or doctor assistant to be recalled.`;
    }

    const notification = await Notification.create({
      userId: patientUserId,
      title,
      message,
      type: notifType,
      relatedAppointmentId: token.appointmentId,
      relatedTokenId: token._id
    });

    emitNotification(patientUserId, notification);
  }

  // Real-time broadcast
  emitQueueUpdate({
    departmentId: token.departmentId?._id,
    doctorId: token.doctorId?._id,
    userId: patientUserId,
    token
  });

  return token;
};

/**
 * Retrieves the full live queue for a department and date
 */
const getDepartmentQueue = async (departmentId, serviceDate) => {
  const dateQuery = serviceDate || new Date().toISOString().split('T')[0];

  const tokens = await Token.find({
    departmentId,
    serviceDate: dateQuery,
    queueStatus: { $ne: 'CANCELLED' } // Don't show cancelled in active queue list
  })
    .sort({ tokenSequence: 1 })
    .populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'fullName phone' }
    })
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'fullName' }
    })
    .populate('departmentId', 'name departmentCode');

  // Compute position & estimated wait times for each active token
  const enrichedTokens = await Promise.all(
    tokens.map(async (t) => {
      const positionInfo = await calculateQueuePosition(t._id);
      return {
        _id: t._id,
        tokenNumber: t.tokenNumber,
        tokenSequence: t.tokenSequence,
        queueStatus: t.queueStatus,
        patientName: t.patientId?.userId?.fullName || 'Walk-in Patient',
        patientPhone: t.patientId?.userId?.phone || '',
        doctorName: t.doctorId?.userId?.fullName || 'Assigned Doctor',
        roomNumber: t.doctorId?.roomNumber || 'Room 101',
        departmentName: t.departmentId?.name || '',
        issuedAt: t.issuedAt,
        calledAt: t.calledAt,
        consultationStartedAt: t.consultationStartedAt,
        completedAt: t.completedAt,
        positionInfo
      };
    })
  );

  return enrichedTokens;
};

/**
 * Retrieves queue for a specific doctor
 */
const getDoctorQueue = async (doctorId, serviceDate) => {
  const dateQuery = serviceDate || new Date().toISOString().split('T')[0];

  const tokens = await Token.find({
    doctorId,
    serviceDate: dateQuery
  })
    .sort({ tokenSequence: 1 })
    .populate({
      path: 'patientId',
      populate: { path: 'userId', select: 'fullName phone' }
    })
    .populate('appointmentId')
    .populate('departmentId', 'name departmentCode');

  // Active waiting or called tokens
  const waitingTokens = tokens.filter((t) =>
    ['WAITING', 'CALLED', 'SKIPPED'].includes(t.queueStatus)
  );
  const inConsultation = tokens.find((t) => t.queueStatus === 'IN_CONSULTATION') || null;
  const completed = tokens.filter((t) => t.queueStatus === 'COMPLETED');

  return {
    serviceDate: dateQuery,
    totalToday: tokens.length,
    waitingCount: waitingTokens.length,
    completedCount: completed.length,
    currentConsultation: inConsultation,
    tokens
  };
};

module.exports = {
  VALID_TRANSITIONS,
  generateSequentialToken,
  validateStatusTransition,
  calculateQueuePosition,
  updateTokenStatus,
  getDepartmentQueue,
  getDoctorQueue
};
