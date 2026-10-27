const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: true,
      trim: true
    },
    tokenSequence: {
      type: Number,
      required: true
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true
    },
    serviceDate: {
      type: String, // Format: YYYY-MM-DD
      required: true
    },
    queueStatus: {
      type: String,
      enum: [
        'BOOKED',
        'WAITING',
        'CALLED',
        'IN_CONSULTATION',
        'COMPLETED',
        'SKIPPED',
        'CANCELLED',
        'NO_SHOW'
      ],
      default: 'WAITING'
    },
    priority: {
      type: Boolean,
      default: false
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    calledAt: {
      type: Date
    },
    consultationStartedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    skippedAt: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast queue lookups and uniqueness within day & department
tokenSchema.index({ departmentId: 1, serviceDate: 1, tokenSequence: 1 });
tokenSchema.index({ doctorId: 1, serviceDate: 1, queueStatus: 1 });
tokenSchema.index({ patientId: 1, serviceDate: 1 });
tokenSchema.index({ departmentId: 1, serviceDate: 1, queueStatus: 1 });

module.exports = mongoose.model('Token', tokenSchema);
