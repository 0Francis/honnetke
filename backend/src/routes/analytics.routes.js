const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { getAnalytics } = require('../controllers/analytics.controller');

router.get('/:listingId', protect, allowRoles('landlord', 'agent'), getAnalytics);

module.exports = router;
