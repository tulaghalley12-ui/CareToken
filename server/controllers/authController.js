const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { generateToken } = require('../utils/jwt');
const { logActivity } = require('../utils/activityLogger');

/**
 * Register public patient account
 */
const registerPatient = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
      bloodGroup
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, phone, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Patients can only register with 'patient' role
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: 'patient'
    });

    // Generate unique patient number PAT-XXXXX
    const patientCount = await Patient.countDocuments();
    const patientNumber = `PAT-${String(patientCount + 10001)}`;

    const patient = await Patient.create({
      userId: user._id,
      patientNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || 'prefer_not_to_say',
      address: address || {},
      bloodGroup: bloodGroup || 'Unknown'
    });

    const token = generateToken({ id: user._id, role: user.role });

    await logActivity({
      req: { user },
      action: 'PATIENT_REGISTERED',
      resourceType: 'User',
      resourceId: user._id
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        patientId: patient._id,
        patientNumber: patient.patientNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register privileged staff (Doctor, Receptionist, Admin) - Admin Only
 */
const registerStaff = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role,
      departmentId,
      specialization,
      qualifications,
      consultationDurationMinutes,
      roomNumber
    } = req.body;

    if (!['doctor', 'receptionist', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be doctor, receptionist, or admin.'
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'Staff@1234', salt);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role
    });

    let extraProfile = null;

    if (role === 'doctor') {
      if (!departmentId || !specialization) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Department and specialization are required for doctor accounts.'
        });
      }

      const docCount = await Doctor.countDocuments();
      const doctorNumber = `DOC-${String(docCount + 101)}`;

      extraProfile = await Doctor.create({
        userId: user._id,
        doctorNumber,
        departmentId,
        specialization,
        qualifications: qualifications || 'MBBS, MD',
        consultationDurationMinutes: consultationDurationMinutes || 15,
        roomNumber: roomNumber || 'Room 101'
      });
    }

    await logActivity({
      req,
      action: 'STAFF_REGISTERED',
      resourceType: 'User',
      resourceId: user._id,
      metadata: { role }
    });

    res.status(201).json({
      success: true,
      message: `${role.toUpperCase()} account created successfully`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        extraProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    // Attach role-specific sub-document IDs
    let patientData = null;
    let doctorData = null;

    if (user.role === 'patient') {
      patientData = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      doctorData = await Doctor.findOne({ userId: user._id }).populate('departmentId');
    }

    await logActivity({
      req: { user, ip: req.ip },
      action: 'USER_LOGIN',
      resourceType: 'User',
      resourceId: user._id
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        patient: patientData,
        doctor: doctorData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * Get current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let patientData = null;
    let doctorData = null;

    if (user.role === 'patient') {
      patientData = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      doctorData = await Doctor.findOne({ userId: user._id }).populate('departmentId');
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        patient: patientData,
        doctor: doctorData
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPatient,
  registerStaff,
  login,
  logout,
  getMe
};
