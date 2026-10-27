const ActivityLog = require('../models/ActivityLog');

/**
 * Get system activity logs (Admin only)
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const { action, resourceType, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ActivityLog.countDocuments(filter)
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityLogs
};
