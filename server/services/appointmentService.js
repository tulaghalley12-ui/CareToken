const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const DoctorSchedule = require('../models/DoctorSchedule');
const Patient = require('../models/Patient');
const { generateSequentialToken, updateTokenStatus } = require('./tokenService');
const Notification = require('../models/Notification');
const { emitNotification } = require('../sockets/queueSocket');

/**
 * Generate time slots between start and end time with given duration, excluding breaks
 */
const generateSlotsForDay = (startTime, endTime, durationMinutes, breakPeriods = []) => {
  const slots = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes + durationMinutes <= endMinutes) {
    const slotH = Math.floor(currentMinutes / 60);
    const slotM = currentMinutes % 60;
    const timeString = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`;

    // Check if slot falls inside any break period
    const inBreak = breakPeriods.some((b) => {
      const [bStartH, bStartM] = b.start.split(':').map(Number);
      const [bEndH, bEndM] = b.end.split(':').map(Number);
      const bStartMin = bStartH * 60 + bStartM;
      const bEndMin = bEndH * 60 + bEndM;
      return currentMinutes >= bStartMin && currentMinutes < bEndMin;
    });

    if (!inBreak) {
      slots.push(timeString);
    }

    currentMinutes += durationMinutes;
  }

  return slots;
};

/**
 * Get available slots for a doctor on a specific date
 */
const getAvailableSlots = async (doctorId, dateString) => {
  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const error = new Error('Invalid date format. Expected YYYY-MM-DD.');
    error.statusCode = 400;
    throw error;
  }

  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    const error = new Error('Doctor not found');
    error.statusCode = 404;
    throw error;
  }

  if (!doctor.isAvailable) {
    return {
      doctorId,
      date: dateString,
      isAvailable: false,
      reason: 'Doctor is currently marked as unavailable',
      slots: []
    };
  }

  const targetDate = new Date(`${dateString}T00:00:00`);
  const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 1 = Monday, ...

  // Check schedule configuration for this doctor and day
  let schedule = await DoctorSchedule.findOne({
    doctorId,
    dayOfWeek,
    isActive: true
  });

  // Default fallback schedule if none explicitly saved (Mon-Fri 09:00 - 17:00)
  let startTime = '09:00';
  let endTime = '17:00';
  let duration = doctor.consultationDurationMinutes || 15;
  let breaks = [{ start: '13:00', end: '14:00' }];

  if (schedule) {
    startTime = schedule.startTime;
    endTime = schedule.endTime;
    duration = schedule.slotDurationMinutes || duration;
    breaks = schedule.breakPeriods || [];
  } else {
    // If it is Sunday (0) or Saturday (6) and no explicit schedule, closed by default
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        doctorId,
        date: dateString,
        isAvailable: false,
        reason: 'Doctor does not practice on weekends',
        slots: []
      };
    }
  }

  // Generate all possible slots for the day
  const allSlots = generateSlotsForDay(startTime, endTime, duration, breaks);

  // Find existing booked/confirmed appointments for this doctor on this date
  const bookedAppointments = await Appointment.find({
    doctorId,
    appointmentDate: dateString,
    status: { $in: ['BOOKED', 'CONFIRMED'] }
  }).select('appointmentTime');

  const bookedSet = new Set(bookedAppointments.map((a) => a.appointmentTime));

  const slotsWithStatus = allSlots.map((time) => ({
    time,
    isAvailable: !bookedSet.has(time)
  }));

  return {
    doctorId,
    date: dateString,
    durationMinutes: duration,
    isAvailable: true,
    totalSlots: allSlots.length,
    availableCount: slotsWithStatus.filter((s) => s.isAvailable).length,
    slots: slotsWithStatus
  };
};

/**
 * Creates an appointment with validations, double-booking prevention, and auto-token generation
 */
const createAppointment = async ({
  patientId,
  doctorId,
  departmentId,
  appointmentDate,
  appointmentTime,
  appointmentType = 'ROUTINE',
  bookingSource = 'ONLINE_PATIENT',
  reasonForVisit = '',
  priority = false
}) => {
  // 1. Validate date (cannot book past dates)
  const todayStr = new Date().toISOString().split('T')[0];
  if (appointmentDate < todayStr) {
    const error = new Error('Cannot book appointments for past dates');
    error.statusCode = 400;
    throw error;
  }

  // 2. Validate doctor and department existence
  const doctor = await Doctor.findById(doctorId);
  if (!doctor || !doctor.isAvailable) {
    const error = new Error('Selected doctor is not available for appointments');
    error.statusCode = 400;
    throw error;
  }

  const patient = await Patient.findById(patientId).populate('userId');
  if (!patient) {
    const error = new Error('Patient record not found');
    error.statusCode = 404;
    throw error;
  }

  // 3. Double-booking check: Prevent duplicate booking for the same doctor at the same slot
  const existingDoctorBooking = await Appointment.findOne({
    doctorId,
    appointmentDate,
    appointmentTime,
    status: { $in: ['BOOKED', 'CONFIRMED'] }
  });

  if (existingDoctorBooking) {
    const error = new Error('This time slot is already booked for the selected doctor');
    error.statusCode = 409;
    throw error;
  }

  // 4. Prevent patient from booking two appointments at the exact same time
  const existingPatientBooking = await Appointment.findOne({
    patientId,
    appointmentDate,
    appointmentTime,
    status: { $in: ['BOOKED', 'CONFIRMED'] }
  });

  if (existingPatientBooking) {
    const error = new Error('Patient already has an active appointment at this date and time');
    error.statusCode = 409;
    throw error;
  }

  // 5. Create appointment record
  const appointment = await Appointment.create({
    patientId,
    doctorId,
    departmentId: departmentId || doctor.departmentId,
    appointmentDate,
    appointmentTime,
    appointmentType,
    bookingSource,
    reasonForVisit,
    status: 'BOOKED'
  });

  // 6. Generate sequential token atomically
  let token = null;
  try {
    token = await generateSequentialToken({
      appointmentId: appointment._id,
      patientId,
      doctorId,
      departmentId: departmentId || doctor.departmentId,
      serviceDate: appointmentDate,
      priority
    });
  } catch (tokenErr) {
    // If token limit reached or generation failed, mark appointment as cancelled or handle
    await Appointment.findByIdAndUpdate(appointment._id, {
      status: 'CANCELLED',
      cancellationReason: tokenErr.message
    });
    throw tokenErr;
  }

  // 7. Send notification to patient if user account exists
  if (patient.userId?._id) {
    const notif = await Notification.create({
      userId: patient.userId._id,
      title: 'Appointment & Token Confirmed',
      message: `Your appointment is confirmed for ${appointmentDate} at ${appointmentTime}. Token Number: ${token.tokenNumber}`,
      type: 'APPOINTMENT_CONFIRMED',
      relatedAppointmentId: appointment._id,
      relatedTokenId: token._id
    });
    emitNotification(patient.userId._id, notif);
  }

  return {
    appointment,
    token
  };
};

/**
 * Cancel an appointment with token status transition
 */
const cancelAppointment = async (appointmentId, reason, requestingUser) => {
  const appointment = await Appointment.findById(appointmentId).populate('tokenId');
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.statusCode = 404;
    throw error;
  }

  if (['CANCELLED', 'COMPLETED'].includes(appointment.status)) {
    const error = new Error(`Cannot cancel an appointment that is already ${appointment.status}`);
    error.statusCode = 400;
    throw error;
  }

  appointment.status = 'CANCELLED';
  appointment.cancellationReason = reason || 'Cancelled by user or administrator';
  await appointment.save();

  // Cancel associated token if present
  if (appointment.tokenId) {
    await updateTokenStatus(appointment.tokenId._id || appointment.tokenId, 'CANCELLED', {
      reason: appointment.cancellationReason
    });
  }

  return appointment;
};

module.exports = {
  getAvailableSlots,
  createAppointment,
  cancelAppointment
};
