const express = require('express');
const router = express.Router();
const {
  registerPatient,
  registerStaff,
  login,
  logout,
  getMe
} = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Public endpoints
router.post('/register', authLimiter, registerPatient);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Authenticated endpoints
router.get('/me', authenticate, getMe);

// Admin-only endpoints
router.post('/register-staff', authenticate, authorize('admin'), registerStaff);

module.exports = router;
