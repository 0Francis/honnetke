const prisma = require('../config/prisma');

/* ═══════════════════════════════════════════════════════
   GET /api/favourites  — list student's favourites
   ═══════════════════════════════════════════════════════ */
const getFavourites = async (req, res, next) => {
  try {
    const favourites = await prisma.favourite.findMany({
      where: { studentId: req.user.id },
      include: {
        listing: {
          include: {
            images: { take: 1, orderBy: { isPrimary: 'desc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ favourites });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   POST /api/favourites  — add a listing to favourites
   Body: listingId
   ═══════════════════════════════════════════════════════ */
const addFavourite = async (req, res, next) => {
  try {
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ message: 'listingId is required' });
    }

    const listing = await prisma.listing.findUnique({
      where: { listingId: Number(listingId) },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check for duplicate
    const existing = await prisma.favourite.findUnique({
      where: {
        studentId_listingId: {
          studentId: req.user.id,
          listingId: Number(listingId),
        },
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Already in favourites' });
    }

    const favourite = await prisma.favourite.create({
      data: {
        studentId: req.user.id,
        listingId: Number(listingId),
      },
    });

    res.status(201).json({
      message: 'Added to favourites',
      favourite,
    });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   DELETE /api/favourites/:id  — remove a favourite
   :id is the listingId (not favouriteId) for easier frontend use
   ═══════════════════════════════════════════════════════ */
const removeFavourite = async (req, res, next) => {
  try {
    const listingId = Number(req.params.id);

    const favourite = await prisma.favourite.findUnique({
      where: {
        studentId_listingId: {
          studentId: req.user.id,
          listingId,
        },
      },
    });

    if (!favourite) {
      return res.status(404).json({ message: 'Favourite not found' });
    }

    await prisma.favourite.delete({
      where: { favouriteId: favourite.favouriteId },
    });

    res.json({ message: 'Removed from favourites' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getFavourites, addFavourite, removeFavourite };
