const express = require('express');
const router = express.Router();
const {
  getTokenById,
  getMyTokens,
  getDepartmentQueueHandler,
  issueToken,
  callToken,
  startConsultation,
  completeToken,
  skipToken,
  recallToken,
  cancelTokenHandler
} = require('../controllers/tokenController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public or semi-public queue view for waiting room displays
router.get('/queue/:departmentId', getDepartmentQueueHandler);
router.get('/track/:id', getTokenById);

// Protected routes
router.use(authenticate);

router.get('/my-tokens', getMyTokens);
router.get('/:id', getTokenById);
router.post('/', authorize('admin', 'receptionist'), issueToken);

// State transitions
router.patch('/:id/call', authorize('admin', 'doctor', 'receptionist'), callToken);
router.patch('/:id/start-consultation', authorize('admin', 'doctor'), startConsultation);
router.patch('/:id/complete', authorize('admin', 'doctor'), completeToken);
router.patch('/:id/skip', authorize('admin', 'doctor'), skipToken);
router.patch('/:id/recall', authorize('admin', 'doctor', 'receptionist'), recallToken);
router.patch('/:id/cancel', authorize('admin', 'doctor', 'receptionist', 'patient'), cancelTokenHandler);

module.exports = router;
