const prisma = require('../config/prisma');

/* ── Helper: get listings owned by the provider ── */
async function getProviderListings(req) {
  const where = req.user.role === 'landlord'
    ? { landlordId: req.user.id }
    : { agentId: req.user.id };
  return prisma.listing.findMany({
    where,
    select: {
      listingId: true,
      title: true,
      area: true,
      nearestCampus: true,
      status: true,
      analytics: { orderBy: { weekStart: 'desc' }, take: 1 },
    },
  });
}

/* ═══════════════════════════════════════════════════════
   GET /api/analytics/:listingId  — analytics for a single listing
   ═══════════════════════════════════════════════════════ */
const getAnalytics = async (req, res, next) => {
  try {
    const listingId = Number(req.params.listingId);

    // Verify ownership
    const listing = await prisma.listing.findUnique({
      where: { listingId },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const isOwner =
      (req.user.role === 'landlord' && listing.landlordId === req.user.id) ||
      (req.user.role === 'agent' && listing.agentId === req.user.id);

    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized to view analytics for this listing' });
    }

    const analytics = await prisma.analytics.findMany({
      where: { listingId },
      orderBy: { weekStart: 'desc' },
      take: 8, // last 8 weeks
    });

    const totalViews = analytics.reduce((sum, a) => sum + a.viewCount, 0);
    const thisWeek = analytics[0]?.viewCount || 0;

    res.json({
      listingId,
      title: listing.title,
      weeklyData: analytics.reverse(), // chronological order
      totalViews,
      thisWeekViews: thisWeek,
    });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   GET /api/analytics  — overview analytics for the provider
   (all their listings combined)
   ═══════════════════════════════════════════════════════ */
const getOverviewAnalytics = async (req, res, next) => {
  try {
    const listings = await getProviderListings(req);

    if (listings.length === 0) {
      return res.json({
        totalViews: 0,
        thisWeekViews: 0,
        mostViewedListing: null,
        perListing: [],
      });
    }

    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    let totalViews = 0;
    let thisWeekViews = 0;
    let mostViewedListing = null;
    let maxViews = -1;

    const perListing = listings.map(l => {
      const total = l.analytics.reduce((sum, a) => sum + a.viewCount, 0);
      const thisWeek = l.analytics.find(a => a.weekStart >= weekAgo)?.viewCount || 0;
      totalViews += total;
      thisWeekViews += thisWeek;

      if (total > maxViews) {
        maxViews = total;
        mostViewedListing = l.title;
      }

      return {
        listingId: l.listingId,
        title: l.title,
        area: l.area,
        nearestCampus: l.nearestCampus,
        status: l.status,
        thisWeekViews: thisWeek,
        totalViews: total,
      };
    });

    res.json({
      totalViews,
      thisWeekViews,
      mostViewedListing,
      perListing,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics, getOverviewAnalytics };
