const prisma = require('../config/prisma');
const { withAvailability } = require('../utils/property');
const { providerFilter } = require('../utils/roles');

/* ===========================================================
   GET /api/me/history  - student's recently viewed properties
   =========================================================== */
const getHistory = async (req, res, next) => {
  try {
    const history = await prisma.viewHistory.findMany({
      where: { studentId: req.user.id },
      include: {
        property: {
          include: {
            images: { take: 1, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: 50,
    });

    res.json({
      history: history.map(h => ({
        viewedAt: h.viewedAt,
        property: withAvailability(h.property),
      })),
    });
  } catch (err) {
    next(err);
  }
};

/* ===========================================================
   DELETE /api/me/history  - clear the student's view history
   =========================================================== */
const clearHistory = async (req, res, next) => {
  try {
    await prisma.viewHistory.deleteMany({ where: { studentId: req.user.id } });
    res.json({ message: 'History cleared' });
  } catch (err) {
    next(err);
  }
};

/* ===========================================================
   GET /api/me/profile-stats  - lightweight counts for profile
   Returns role-specific stats using fast count() queries.
   =========================================================== */
const getProfileStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const id = req.user.id;
    const stats = {};

    if (role === 'landlord' || role === 'agent') {
      const filter = providerFilter(req.user);
      const [totalProperties, activeProperties, totalBookings, viewsAgg] = await Promise.all([
        prisma.property.count({ where: filter }),
        prisma.property.count({ where: { ...filter, status: 'active' } }),
        prisma.booking.count({ where: { property: filter } }),
        prisma.analytics.aggregate({ where: { property: filter }, _sum: { viewCount: true } }),
      ]);
      stats.totalProperties = totalProperties;
      stats.activeProperties = activeProperties;
      stats.totalBookings = totalBookings;
      stats.totalViews = viewsAgg._sum.viewCount || 0;
    } else if (role === 'student') {
      const [favourites, hostelsViewed] = await Promise.all([
        prisma.favourite.count({ where: { studentId: id } }),
        prisma.viewHistory.count({ where: { studentId: id } }),
      ]);
      stats.favourites = favourites;
      stats.hostelsViewed = hostelsViewed;
    } else if (role === 'admin') {
      const [students, landlords, agents, totalProperties, pendingProperties, pendingReports] = await Promise.all([
        prisma.student.count(),
        prisma.landlord.count(),
        prisma.agent.count(),
        prisma.property.count(),
        prisma.property.count({ where: { status: 'pending_approval' } }),
        prisma.report.count({ where: { status: 'pending' } }),
      ]);
      stats.usersManaged = students + landlords + agents;
      stats.propertiesReviewed = totalProperties - pendingProperties;
      stats.reportsResolved = pendingReports;
    }

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

module.exports = { getHistory, clearHistory, getProfileStats };
