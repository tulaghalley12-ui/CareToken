const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ req, action, resourceType, resourceId, metadata = {} }) => {
  try {
    const user = req?.user;
    const ipAddress = req?.ip || req?.connection?.remoteAddress || '';

    // Sanitize metadata - ensure no passwords, secrets, or raw auth tokens are logged
    const cleanMeta = { ...metadata };
    delete cleanMeta.password;
    delete cleanMeta.passwordHash;
    delete cleanMeta.token;
    delete cleanMeta.authorization;

    await ActivityLog.create({
      userId: user?._id || null,
      userEmail: user?.email || 'unauthenticated',
      userRole: user?.role || 'anonymous',
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : null,
      ipAddress,
      metadata: cleanMeta
    });
  } catch (err) {
    // Audit logging should not crash the primary operational transaction
    console.error('Failed to write activity log:', err.message);
  }
};

module.exports = { logActivity };
