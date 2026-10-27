const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: [
        'TOKEN_CALLED',
        'TOKEN_STATUS',
        'APPOINTMENT_CONFIRMED',
        'APPOINTMENT_CANCELLED',
        'GENERAL'
      ],
      default: 'GENERAL'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    relatedTokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token'
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
