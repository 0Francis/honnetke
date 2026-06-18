const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const {
  getBookings,
  createBooking,
  updateBookingStatus,
} = require('../controllers/bookings.controller');

router.get('/', protect, getBookings);
router.post('/', protect, allowRoles('student'), createBooking);
router.patch('/:id', protect, allowRoles('landlord', 'agent', 'student'), updateBookingStatus);

module.exports = router;
