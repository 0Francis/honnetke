const prisma = require('../config/prisma');
const { providerFilter } = require('../utils/roles');
const { computeAvailability } = require('../utils/property');
const {
  sendBookingAcceptedEmail,
  sendBookingRejectedEmail,
  sendVisitInvitationEmail,
} = require('../utils/mailer');

/* Helper: ids of properties owned by the current provider. */
async function getProviderPropertyIds(req) {
  const properties = await prisma.property.findMany({
    where: providerFilter(req.user),
    select: { propertyId: true },
  });
  return properties.map(p => p.propertyId);
}

/* ═══════════════════════════════════════════════════════
   GET /api/bookings  - list bookings for the current user
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
      const propertyIds = await getProviderPropertyIds(req);
      if (propertyIds.length === 0) {
        return res.json({ bookings: [] });
      }
      where.propertyId = { in: propertyIds };
    } else {
      return res.status(403).json({ message: 'Not authorized to view bookings' });
    }

    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        student: { select: { fullName: true, email: true, phoneNumber: true } },
        property: {
          select: {
            title: true, area: true, nearestCampus: true,
            capacity: true, occupied: true,
            images: { take: 1, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   POST /api/bookings  - student creates a booking request
   Body: listingId, requestNote
   ═══════════════════════════════════════════════════════ */
const createBooking = async (req, res, next) => {
  try {
    const propertyId = Number(req.body.propertyId || req.body.listingId);

    if (!propertyId) {
      return res.status(400).json({ message: 'propertyId is required' });
    }

    const property = await prisma.property.findUnique({ where: { propertyId } });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'active') {
      return res.status(400).json({ message: 'This property is not available for booking' });
    }

    if (computeAvailability(property.capacity, property.occupied) === 'full') {
      return res.status(400).json({ message: 'This property is fully occupied' });
    }

    // Block a second active request for the same property.
    const existing = await prisma.booking.findFirst({
      where: {
        studentId: req.user.id,
        propertyId,
        status: { in: ['pending', 'accepted', 'visited'] },
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'You already have an active booking for this property' });
    }

    const booking = await prisma.booking.create({
      data: {
        studentId: req.user.id,
        propertyId,
        requestNote: req.body.requestNote || null,
        status: 'pending',
      },
      include: {
        property: { select: { title: true, landlordId: true, agentId: true } },
      },
    });

    const providerId = booking.property.landlordId || booking.property.agentId;
    const providerRole = booking.property.landlordId ? 'landlord' : 'agent';
    const student = await prisma.student.findUnique({
      where: { studentId: req.user.id },
      select: { fullName: true },
    });

    if (providerId) {
      await prisma.notification.create({
        data: {
          [providerRole + 'Id']: providerId,
          bookingId: booking.bookingId,
          message: `New booking request from ${student.fullName} for "${booking.property.title}".`,
          type: 'booking_update',
          isRead: false,
        },
      });
    }

    await prisma.notification.create({
      data: {
        studentId: req.user.id,
        bookingId: booking.bookingId,
        message: `Your booking request for "${booking.property.title}" is pending.`,
        type: 'booking_update',
        isRead: false,
      },
    });

    res.status(201).json({ message: 'Booking request submitted', booking });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/bookings/:id  - update booking status
   • Landlords/Agents: confirm, decline, cancel
   • Students: cancel their own booking
   Body: status, providerResponse
   ═══════════════════════════════════════════════════════ */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, providerResponse } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { bookingId: Number(req.params.id) },
      include: {
        student: { select: { studentId: true, fullName: true, email: true } },
        property: {
          select: {
            propertyId: true, title: true, landlordId: true, agentId: true,
            capacity: true, occupied: true, status: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isStudent = req.user.role === 'student' && booking.studentId === req.user.id;
    const isProvider =
      (req.user.role === 'landlord' && booking.property.landlordId === req.user.id) ||
      (req.user.role === 'agent' && booking.property.agentId === req.user.id);

    if (!isStudent && !isProvider) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Allowed transitions per actor.
    const providerTransitions = {
      pending: ['accepted', 'rejected'],
      accepted: ['visited', 'completed', 'cancelled'],
      visited: ['completed', 'cancelled'],
    };
    const studentTransitions = {
      pending: ['cancelled'],
      accepted: ['cancelled'],
      visited: ['cancelled'],
    };

    const map = isProvider ? providerTransitions : studentTransitions;
    const allowedNext = map[booking.status] || [];

    if (!status || !allowedNext.includes(status)) {
      return res.status(400).json({
        message: `Cannot change a ${booking.status} booking to "${status}". Allowed: ${allowedNext.join(', ') || 'none'}.`,
      });
    }

    // Capacity adjustments.
    const cap = booking.property.capacity;
    const occupied = booking.property.occupied;
    let occupiedDelta = 0;

    if (status === 'accepted') {
      if (occupied >= cap) {
        return res.status(400).json({ message: 'Property is at full capacity; cannot accept more bookings.' });
      }
      occupiedDelta = 1;
    } else if (status === 'cancelled' && booking.status !== 'pending') {
      // Cancelling an already-accepted/visited booking frees a slot.
      occupiedDelta = -1;
    }

    const newOccupied = Math.max(0, occupied + occupiedDelta);

    // Derive the property status when occupancy changes.
    let propertyStatusUpdate;
    if (occupiedDelta !== 0) {
      if (computeAvailability(cap, newOccupied) === 'full') {
        propertyStatusUpdate = 'fully_occupied';
      } else if (booking.property.status === 'fully_occupied') {
        propertyStatusUpdate = 'active';
      }
    }

    const data = { status };
    if (providerResponse) data.providerResponse = providerResponse;

    const tx = [
      prisma.booking.update({ where: { bookingId: booking.bookingId }, data }),
    ];
    if (occupiedDelta !== 0 || propertyStatusUpdate) {
      tx.push(
        prisma.property.update({
          where: { propertyId: booking.property.propertyId },
          data: {
            ...(occupiedDelta !== 0 ? { occupied: newOccupied } : {}),
            ...(propertyStatusUpdate ? { status: propertyStatusUpdate } : {}),
          },
        })
      );
    }
    const [updated] = await prisma.$transaction(tx);

    // Notify the student about the change.
    await prisma.notification.create({
      data: {
        studentId: booking.studentId,
        bookingId: booking.bookingId,
        message: `Your booking for "${booking.property.title}" has been ${status}.`,
        type: 'booking_update',
        isRead: false,
      },
    });

    // Send relevant emails (non-blocking).
    if (status === 'accepted') {
      sendBookingAcceptedEmail(booking.student.email, booking.student.fullName, booking.property.title)
        .catch(e => console.error('[MAIL] booking accepted:', e.message));
    } else if (status === 'rejected') {
      sendBookingRejectedEmail(booking.student.email, booking.student.fullName, booking.property.title, providerResponse)
        .catch(e => console.error('[MAIL] booking rejected:', e.message));
    }

    res.json({ message: `Booking ${status}`, booking: updated });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/bookings/:id/visit  - provider sends a visit invite
   Valid only for accepted/visited bookings.
   Body: visitDate, visitTime, meetingPoint, visitNotes, mapLink
   ═══════════════════════════════════════════════════════ */
const sendVisitInvitation = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingId: Number(req.params.id) },
      include: {
        student: { select: { fullName: true, email: true } },
        property: { select: { title: true, landlordId: true, agentId: true } },
      },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const isProvider =
      (req.user.role === 'landlord' && booking.property.landlordId === req.user.id) ||
      (req.user.role === 'agent' && booking.property.agentId === req.user.id);

    if (!isProvider) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    if (!['accepted', 'visited'].includes(booking.status)) {
      return res.status(400).json({ message: 'Visit invitations can only be sent for accepted bookings' });
    }

    const { visitDate, visitTime, meetingPoint, visitNotes, mapLink } = req.body;

    const updated = await prisma.booking.update({
      where: { bookingId: booking.bookingId },
      data: {
        visitDate: visitDate ? new Date(visitDate) : null,
        visitTime: visitTime || null,
        meetingPoint: meetingPoint || null,
        visitNotes: visitNotes || null,
        mapLink: mapLink || null,
      },
    });

    await prisma.notification.create({
      data: {
        studentId: booking.studentId,
        bookingId: booking.bookingId,
        message: `You have a visit invitation for "${booking.property.title}".`,
        type: 'visit_invitation',
        isRead: false,
      },
    });

    sendVisitInvitationEmail(booking.student.email, booking.student.fullName, booking.property.title, {
      visitDate, visitTime, meetingPoint, visitNotes, mapLink,
    }).catch(e => console.error('[MAIL] visit invitation:', e.message));

    res.json({ message: 'Visit invitation sent', booking: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBookings, createBooking, updateBookingStatus, sendVisitInvitation };
