const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  updateDoctor,
  getDoctorAppointments,
  getDoctorQueueHandler,
  getDoctorSchedule,
  updateDoctorSchedule
} = require('../controllers/doctorController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public directory
router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/schedule', getDoctorSchedule);

// Authenticated endpoints
router.put('/:id', authenticate, updateDoctor);
router.get('/:id/appointments', authenticate, getDoctorAppointments);
router.get('/:id/queue', authenticate, getDoctorQueueHandler);
router.put('/:id/schedule', authenticate, updateDoctorSchedule);

module.exports = router;
