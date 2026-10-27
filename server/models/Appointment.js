const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required']
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required']
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required']
    },
    appointmentDate: {
      type: String, // Format: YYYY-MM-DD for reliable day-level indexing
      required: [true, 'Appointment date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Appointment date must be in YYYY-MM-DD format']
    },
    appointmentTime: {
      type: String, // Format: HH:MM
      required: [true, 'Appointment time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Appointment time must be in HH:MM format']
    },
    appointmentType: {
      type: String,
      enum: ['FIRST_VISIT', 'FOLLOW_UP', 'EMERGENCY', 'ROUTINE'],
      default: 'ROUTINE'
    },
    bookingSource: {
      type: String,
      enum: ['ONLINE_PATIENT', 'RECEPTIONIST_WALK_IN'],
      default: 'ONLINE_PATIENT'
    },
    status: {
      type: String,
      enum: ['BOOKED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'],
      default: 'BOOKED'
    },
    tokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      default: null
    },
    reasonForVisit: {
      type: String,
      trim: true,
      default: ''
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index to help query doctor daily schedule and prevent overlapping bookings
appointmentSchema.index({ doctorId: 1, appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ departmentId: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
