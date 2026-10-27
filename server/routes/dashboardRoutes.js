const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getDoctorDashboard,
  getReceptionistDashboard,
  getPatientDashboard
} = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(authenticate);

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/doctor', authorize('doctor', 'admin'), getDoctorDashboard);
router.get('/receptionist', authorize('receptionist', 'admin'), getReceptionistDashboard);
router.get('/patient', authorize('patient', 'admin'), getPatientDashboard);

module.exports = router;
