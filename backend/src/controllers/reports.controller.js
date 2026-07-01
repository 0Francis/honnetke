const prisma = require('../config/prisma');

const REPORT_REASONS = ['spam', 'fraud', 'wrong_information', 'already_occupied', 'inappropriate', 'other'];

/* ═══════════════════════════════════════════════════════
   POST /api/reports  - student reports a property
   Body: propertyId, reason (enum), details (optional)
   ═══════════════════════════════════════════════════════ */
const createReport = async (req, res, next) => {
  try {
    const propertyId = Number(req.body.propertyId || req.body.listingId);
    const { reason, details } = req.body;

    if (!propertyId || !reason) {
      return res.status(400).json({ message: 'propertyId and reason are required' });
    }

    if (!REPORT_REASONS.includes(reason)) {
      return res.status(400).json({ message: `reason must be one of: ${REPORT_REASONS.join(', ')}` });
    }

    const property = await prisma.property.findUnique({
      where: { propertyId },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check for duplicate report by same student on same property
    const existing = await prisma.report.findFirst({
      where: {
        studentId: req.user.id,
        propertyId,
        status: 'pending',
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already reported this property and it is under review' });
    }

    const report = await prisma.report.create({
      data: {
        studentId: req.user.id,
        propertyId,
        reason,
        details: details || null,
        status: 'pending',
      },
    });

    // Notify admins
    const admins = await prisma.admin.findMany({ select: { adminId: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(a => ({
          adminId: a.adminId,
          message: `A property has been reported: "${property.title}".`,
          type: 'report',
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
