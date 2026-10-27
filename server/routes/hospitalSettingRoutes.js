const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/hospitalSettingController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getSettings);
router.put('/', authenticate, authorize('admin'), updateSettings);

module.exports = router;
