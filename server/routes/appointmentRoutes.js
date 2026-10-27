const express = require('express');
const router = express.Router();
const {
  getAvailableSlotsHandler,
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointmentHandler
} = require('../controllers/appointmentController');
const { authenticate } = require('../middleware/authMiddleware');

// Available slots can be checked publicly or by authenticated users
router.get('/available-slots', getAvailableSlotsHandler);

// Protected routes
router.use(authenticate);

router.post('/', bookAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.patch('/:id/cancel', cancelAppointmentHandler);

module.exports = router;
