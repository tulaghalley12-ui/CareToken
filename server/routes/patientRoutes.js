const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  getPatientAppointments,
  getPatientTokens
} = require('../controllers/patientController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(authenticate);

// Staff access to list and register patients
router.get('/', authorize('admin', 'receptionist', 'doctor'), getPatients);
router.post('/', authorize('admin', 'receptionist'), createPatient);

// Access to specific patient record
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.get('/:id/appointments', getPatientAppointments);
router.get('/:id/tokens', getPatientTokens);

module.exports = router;
