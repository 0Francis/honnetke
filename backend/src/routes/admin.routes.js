const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const {
  getStats,
  getUsers,
  getPendingListings,
  approveListing,
  declineListing,
  getReports,
  resolveReport,
  issueWarning,
  suspendAccount,
  reactivateAccount,
  getErrorLogs,
  getTrafficLogs,
} = require('../controllers/admin.controller');

router.use(protect, allowRoles('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);

router.get('/listings', getPendingListings);
router.patch('/listings/:id/approve', approveListing);
router.patch('/listings/:id/decline', declineListing);

router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);

router.post('/warnings', issueWarning);
router.patch('/accounts/:id/suspend', suspendAccount);
router.patch('/accounts/:id/reactivate', reactivateAccount);

router.get('/errors', getErrorLogs);
router.get('/traffic', getTrafficLogs);

module.exports = router;
