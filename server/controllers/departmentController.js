const Department = require('../models/Department');
const { logActivity } = require('../utils/activityLogger');

/**
 * List all active departments (or all for admin)
 */
const getDepartments = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' && req.user?.role === 'admin' ? {} : { isActive: true };

    const departments = await Department.find(filter).sort({ name: 1 });
    res.json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get department by ID
 */
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create department (Admin only)
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, description, departmentCode, dailyTokenLimit } = req.body;

    if (!name || !departmentCode) {
      return res.status(400).json({
        success: false,
        message: 'Department name and department code are required.'
      });
    }

    const existingCode = await Department.findOne({
      departmentCode: departmentCode.toUpperCase()
    });
    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: `Department with code '${departmentCode}' already exists.`
      });
    }

    const department = await Department.create({
      name,
      description,
      departmentCode: departmentCode.toUpperCase(),
      dailyTokenLimit: dailyTokenLimit ? Number(dailyTokenLimit) : 50
    });

    await logActivity({
      req,
      action: 'DEPARTMENT_CREATED',
      resourceType: 'Department',
      resourceId: department._id,
      metadata: { name, departmentCode }
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update department (Admin only)
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, departmentCode, dailyTokenLimit, isActive } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (name) department.name = name;
    if (description !== undefined) department.description = description;
    if (departmentCode) department.departmentCode = departmentCode.toUpperCase();
    if (dailyTokenLimit) department.dailyTokenLimit = Number(dailyTokenLimit);
    if (isActive !== undefined) department.isActive = Boolean(isActive);

    await department.save();

    await logActivity({
      req,
      action: 'DEPARTMENT_UPDATED',
      resourceType: 'Department',
      resourceId: department._id
    });

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Soft deactivation of department (Admin only)
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Soft delete to preserve historical integrity
    department.isActive = false;
    await department.save();

    await logActivity({
      req,
      action: 'DEPARTMENT_DEACTIVATED',
      resourceType: 'Department',
      resourceId: department._id
    });

    res.json({
      success: true,
      message: 'Department deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
