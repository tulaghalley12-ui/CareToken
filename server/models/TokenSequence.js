const mongoose = require('mongoose');

const tokenSequenceSchema = new mongoose.Schema(
  {
    departmentCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    serviceDate: {
      type: String, // Format: YYYY-MM-DD
      required: true
    },
    lastSequence: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Unique compound index ensures only one atomic counter per department and day
tokenSequenceSchema.index({ departmentCode: 1, serviceDate: 1 }, { unique: true });

module.exports = mongoose.model('TokenSequence', tokenSequenceSchema);
