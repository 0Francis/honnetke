const prisma = require('../config/prisma');

/* ── Helper: get listings owned by the provider ── */
async function getProviderListingIds(req) {
  const where = req.user.role === 'landlord'
    ? { landlordId: req.user.id }
    : { agentId: req.user.id };
  const listings = await prisma.listing.findMany({ where, select: { listingId: true } });
  return listings.map(l => l.listingId);
}

/* ═══════════════════════════════════════════════════════
   GET /api/bookings  — list bookings for the current user
   • Students see their own bookings
   • Landlords/Agents see bookings for their listings
   Query: status (filter by booking status)
   ═══════════════════════════════════════════════════════ */
const getBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};

    if (req.user.role === 'student') {
      where.studentId = req.user.id;
    } else if (req.user.role === 'landlord' || req.user.role === 'agent') {
      const listingIds = await getProviderListingIds(req);
      if (listingIds.length === 0) {
        return res.json({ bookings: [] });
      }
      where.listingId = { in: listingIds };
    } else {
      return res.status(403).json({ message: 'Not authorized to view bookings' });
    }

    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        student: { select: { fullName: true, email: true, phoneNumber: true } },
        listing: { select: { title: true, area: true, nearestCampus: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   POST /api/bookings  — student creates a booking request
   Body: listingId, requestNote
   ═══════════════════════════════════════════════════════ */
const createBooking = async (req, res, next) => {
  try {
    const { listingId, requestNote } = req.body;

    if (!listingId) {
      return res.status(400).json({ message: 'listingId is required' });
    }

    const listing = await prisma.listing.findUnique({
      where: { listingId: Number(listingId) },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'This listing is not available for booking' });
    }

    // Check for duplicate booking
    const existing = await prisma.booking.findUnique({
      where: {
        studentId_listingId: {
          studentId: req.user.id,
          listingId: Number(listingId),
        },
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already booked this listing' });
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: req.user.id,
        listingId: Number(listingId),
        requestNote: requestNote || null,
        status: 'pending',
      },
      include: {
        listing: { select: { title: true, landlordId: true, agentId: true } },
      },
    });

    // Notify the landlord/agent
    const providerId = booking.listing.landlordId || booking.listing.agentId;
    const providerRole = booking.listing.landlordId ? 'landlord' : 'agent';
    const student = await prisma.student.findUnique({
      where: { studentId: req.user.id },
      select: { fullName: true },
    });

    if (providerId) {
      await prisma.notification.create({
        data: {
          [providerRole + 'Id']: providerId,
          bookingId: booking.bookingId,
          message: `New booking request from ${student.fullName} for "${booking.listing.title}".`,
          type: 'booking_update',
          isRead: false,
        },
      });
    }

    // Notify the student
    await prisma.notification.create({
      data: {
        studentId: req.user.id,
        bookingId: booking.bookingId,
        message: `Your booking request for "${booking.listing.title}" is pending.`,
        type: 'booking_update',
        isRead: false,
      },
    });

    res.status(201).json({
      message: 'Booking request submitted',
      booking,
    });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/bookings/:id  — update booking status
   • Landlords/Agents: confirm, decline, cancel
   • Students: cancel their own booking
   Body: status, providerResponse
   ═══════════════════════════════════════════════════════ */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, providerResponse } = req.body;
    const validStatuses = ['confirmed', 'declined', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: 'status must be one of: confirmed, declined, cancelled',
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { bookingId: Number(req.params.id) },
      include: {
        listing: { select: { title: true, landlordId: true, agentId: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Permission check
    if (req.user.role === 'student') {
      if (booking.studentId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this booking' });
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ message: 'Students can only cancel their own bookings' });
      }
    } else if (req.user.role === 'landlord' || req.user.role === 'agent') {
      const isOwner =
        (req.user.role === 'landlord' && booking.listing.landlordId === req.user.id) ||
        (req.user.role === 'agent' && booking.listing.agentId === req.user.id);
      if (!isOwner) {
        return res.status(403).json({ message: 'Not authorized to update this booking' });
      }
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Can only update pending bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: `Booking is already ${booking.status}` });
    }

    const data = { status };
    if (providerResponse) data.providerResponse = providerResponse;

    const updated = await prisma.booking.update({
      where: { bookingId: booking.bookingId },
      data,
    });

    // Notify the student
    const statusMessage = {
      confirmed: 'confirmed',
      declined: 'declined',
      cancelled: 'cancelled',
    }[status];

    await prisma.notification.create({
      data: {
        studentId: booking.studentId,
        bookingId: booking.bookingId,
        message: `Your booking for "${booking.listing.title}" has been ${statusMessage}.`,
        type: 'booking_update',
        isRead: false,
      },
    });

    res.json({
      message: `Booking ${statusMessage}`,
      booking: updated,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBookings, createBooking, updateBookingStatus };
