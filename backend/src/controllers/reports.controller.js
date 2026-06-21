const prisma = require('../config/prisma');

/* ═══════════════════════════════════════════════════════
   POST /api/reports  — student reports a listing
   Body: listingId, reason
   ═══════════════════════════════════════════════════════ */
const createReport = async (req, res, next) => {
  try {
    const { listingId, reason } = req.body;

    if (!listingId || !reason) {
      return res.status(400).json({ message: 'listingId and reason are required' });
    }

    const listing = await prisma.listing.findUnique({
      where: { listingId: Number(listingId) },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check for duplicate report by same student on same listing
    const existing = await prisma.report.findFirst({
      where: {
        studentId: req.user.id,
        listingId: Number(listingId),
        status: 'pending',
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already reported this listing and it is under review' });
    }

    const report = await prisma.report.create({
      data: {
        studentId: req.user.id,
        listingId: Number(listingId),
        reason,
        status: 'pending',
      },
    });

    // Notify admins
    const admins = await prisma.admin.findMany({ select: { adminId: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          adminId: a.adminId,
          message: `A listing has been reported: "${listing.title}".`,
          type: 'system',
          isRead: false,
        })),
      });
    }

    res.status(201).json({
      message: 'Report submitted. An admin will review it shortly.',
      report,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReport };
