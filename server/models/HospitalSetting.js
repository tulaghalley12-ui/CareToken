const mongoose = require('mongoose');

const hospitalSettingSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      required: true,
      default: 'City General Hospital'
    },
    tagline: {
      type: String,
      default: 'Excellence in Healthcare & Patient Management'
    },
    address: {
      type: String,
      default: '124 Healthcare Boulevard, Medical District'
    },
    contactPhone: {
      type: String,
      default: '+1 (555) 234-5678'
    },
    emergencyPhone: {
      type: String,
      default: '+1 (555) 911-0000'
    },
    contactEmail: {
      type: String,
      default: 'care@citygeneralhospital.org'
    },
    openingHour: {
      type: String,
      default: '08:00'
    },
    closingHour: {
      type: String,
      default: '18:00'
    },
    defaultConsultationMinutes: {
      type: Number,
      default: 15
    },
    enableAutoTokenGeneration: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('HospitalSetting', hospitalSettingSchema);
