const HospitalSetting = require('../models/HospitalSetting');
const { logActivity } = require('../utils/activityLogger');

/**
 * Get hospital settings (Public / Authenticated)
 */
const getSettings = async (req, res, next) => {
  try {
    let settings = await HospitalSetting.findOne();
    if (!settings) {
      settings = await HospitalSetting.create({});
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update hospital settings (Admin only)
 */
const updateSettings = async (req, res, next) => {
  try {
    let settings = await HospitalSetting.findOne();
    if (!settings) {
      settings = new HospitalSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    await logActivity({
      req,
      action: 'HOSPITAL_SETTINGS_UPDATED',
      resourceType: 'HospitalSetting',
      resourceId: settings._id
    });

    res.json({
      success: true,
      message: 'Hospital settings updated successfully',
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
