const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { getHistory, clearHistory, getProfileStats } = require('../controllers/me.controller');

router.get('/profile-stats', protect, getProfileStats);
router.get('/history', protect, allowRoles('student'), getHistory);
router.delete('/history', protect, allowRoles('student'), clearHistory);

module.exports = router;
