const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notifications.controller');

router.get('/', protect, getNotifications);
router.patch('/read-all', protect, markAllAsRead);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
