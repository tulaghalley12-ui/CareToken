const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    doctorNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required']
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true
    },
    qualifications: {
      type: String,
      trim: true,
      default: ''
    },
    consultationDurationMinutes: {
      type: Number,
      required: true,
      default: 15,
      min: [5, 'Consultation duration must be at least 5 minutes']
    },
    availability: {
      type: String,
      trim: true,
      default: 'Monday to Friday, 09:00 - 17:00'
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    roomNumber: {
      type: String,
      trim: true,
      default: 'Room 101'
    },
    bio: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
