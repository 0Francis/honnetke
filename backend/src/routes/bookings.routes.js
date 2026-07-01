const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const {
  getBookings,
  createBooking,
  updateBookingStatus,
  sendVisitInvitation,
} = require('../controllers/bookings.controller');

router.get('/', protect, getBookings);
router.post('/', protect, allowRoles('student'), createBooking);
router.patch('/:id', protect, allowRoles('landlord', 'agent', 'student'), updateBookingStatus);
router.patch('/:id/visit', protect, allowRoles('landlord', 'agent'), sendVisitInvitation);

module.exports = router;
