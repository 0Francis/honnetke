// Sprint 7 - Notifications
const prisma = require('../config/prisma');

/* ── Helper: id-field filter for the current user's role ── */
const ROLE_ID_FIELD = {
  student: 'studentId',
  landlord: 'landlordId',
  agent: 'agentId',
  admin: 'adminId',
};

function userFilter(req) {
  const field = ROLE_ID_FIELD[req.user.role];
  return field ? { [field]: req.user.id } : null;
}

/* ═══════════════════════════════════════════════════════
   GET /api/notifications  - current user's notifications
   Query: unread (true → only unread), limit
   ═══════════════════════════════════════════════════════ */
const getNotifications = async (req, res, next) => {
  try {
    const where = userFilter(req);
    if (!where) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { unread, limit = 30 } = req.query;
    if (unread === 'true') where.isRead = false;

    const take = Math.min(100, parseInt(limit));

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
      }),
      prisma.notification.count({
        where: { ...userFilter(req), isRead: false },
      }),
    ]);

    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/notifications/:id/read  - mark one as read
   ═══════════════════════════════════════════════════════ */
const markAsRead = async (req, res, next) => {
  try {
    const filter = userFilter(req);
    if (!filter) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const notification = await prisma.notification.findUnique({
      where: { notificationId: Number(req.params.id) },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Ensure the notification belongs to the requesting user
    const field = ROLE_ID_FIELD[req.user.role];
    if (notification[field] !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    const updated = await prisma.notification.update({
      where: { notificationId: notification.notificationId },
      data: { isRead: true },
    });

    res.json({ message: 'Notification marked as read', notification: updated });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/notifications/read-all  - mark all as read
   ═══════════════════════════════════════════════════════ */
const markAllAsRead = async (req, res, next) => {
  try {
    const filter = userFilter(req);
    if (!filter) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const result = await prisma.notification.updateMany({
      where: { ...filter, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read', count: result.count });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   DELETE /api/notifications/:id  - delete a notification
   ═══════════════════════════════════════════════════════ */
const deleteNotification = async (req, res, next) => {
  try {
    const filter = userFilter(req);
    if (!filter) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const notification = await prisma.notification.findUnique({
      where: { notificationId: Number(req.params.id) },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const field = ROLE_ID_FIELD[req.user.role];
    if (notification[field] !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await prisma.notification.delete({
      where: { notificationId: notification.notificationId },
    });

    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
