const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { getAnalytics, getOverviewAnalytics } = require('../controllers/analytics.controller');

router.get('/', protect, allowRoles('landlord', 'agent'), getOverviewAnalytics);
router.get('/:listingId', protect, allowRoles('landlord', 'agent'), getAnalytics);

module.exports = router;
