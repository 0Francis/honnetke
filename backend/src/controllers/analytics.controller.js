const prisma = require('../config/prisma');
const { providerFilter } = require('../utils/roles');

/* Helper: properties owned by the provider, with latest analytics. */
async function getProviderProperties(req) {
  return prisma.property.findMany({
    where: providerFilter(req.user),
    select: {
      propertyId: true,
      title: true,
      area: true,
      nearestCampus: true,
      status: true,
      analytics: { orderBy: { weekStart: 'desc' }, take: 1 },
    },
  });
}

/* ═══════════════════════════════════════════════════════
   GET /api/analytics/:listingId  - analytics for a single listing
   ═══════════════════════════════════════════════════════ */
const getAnalytics = async (req, res, next) => {
  try {
    const propertyId = Number(req.params.propertyId);

    // Verify ownership
    const property = await prisma.property.findUnique({
      where: { propertyId },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const isOwner =
      (req.user.role === 'landlord' && property.landlordId === req.user.id) ||
      (req.user.role === 'agent' && property.agentId === req.user.id);

    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to view analytics for this property' });
    }

    const analytics = await prisma.analytics.findMany({
      where: { propertyId },
      orderBy: { weekStart: 'desc' },
      take: 8, // last 8 weeks
    });

    const totalViews = analytics.reduce((sum, a) => sum + a.viewCount, 0);
    const thisWeek = analytics[0]?.viewCount || 0;

    res.json({
      propertyId,
      title: property.title,
      weeklyData: analytics.reverse(), // chronological order
      totalViews,
      thisWeekViews: thisWeek,
    });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   GET /api/analytics  - overview analytics for the provider
   (all their listings combined)
   ═══════════════════════════════════════════════════════ */
const getOverviewAnalytics = async (req, res, next) => {
  try {
    const properties = await getProviderProperties(req);

    if (properties.length === 0) {
      return res.json({
        totalViews: 0,
        thisWeekViews: 0,
        mostViewedProperty: null,
        perProperty: [],
      });
    }

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    let totalViews = 0;
    let thisWeekViews = 0;
    let mostViewedProperty = null;
    let maxViews = -1;

    const perProperty = properties.map(p => {
      const total = p.analytics.reduce((sum, a) => sum + a.viewCount, 0);
      const thisWeek = p.analytics.find(a => a.weekStart >= weekAgo)?.viewCount || 0;
      totalViews += total;
      thisWeekViews += thisWeek;

      if (total > maxViews) {
        maxViews = total;
        mostViewedProperty = p.title;
      }

      return {
        propertyId: p.propertyId,
        title: p.title,
        area: p.area,
        nearestCampus: p.nearestCampus,
        status: p.status,
        thisWeekViews: thisWeek,
        totalViews: total,
      };
    });

    res.json({
      totalViews,
      thisWeekViews,
      mostViewedProperty,
      perProperty,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics, getOverviewAnalytics };
