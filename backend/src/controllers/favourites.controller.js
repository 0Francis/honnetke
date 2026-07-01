const prisma = require('../config/prisma');

/* ═══════════════════════════════════════════════════════
   GET /api/favourites  - list student's favourites
   ═══════════════════════════════════════════════════════ */
const getFavourites = async (req, res, next) => {
  try {
    const favourites = await prisma.favourite.findMany({
      where: { studentId: req.user.id },
      include: {
        property: {
          include: {
            images: { take: 1, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
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
   POST /api/favourites  - add a listing to favourites
   Body: listingId
   ═══════════════════════════════════════════════════════ */
const addFavourite = async (req, res, next) => {
  try {
    const propertyId = Number(req.body.propertyId || req.body.listingId);

    if (!propertyId) {
      return res.status(400).json({ message: 'propertyId is required' });
    }

    const property = await prisma.property.findUnique({
      where: { propertyId },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check for duplicate
    const existing = await prisma.favourite.findUnique({
      where: {
        studentId_propertyId: {
          studentId: req.user.id,
          propertyId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Already in favourites' });
    }

    const favourite = await prisma.favourite.create({
      data: {
        studentId: req.user.id,
        propertyId,
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
   DELETE /api/favourites/:id  - remove a favourite
   :id is the listingId (not favouriteId) for easier frontend use
   ═══════════════════════════════════════════════════════ */
const removeFavourite = async (req, res, next) => {
  try {
    const propertyId = Number(req.params.id);

    const favourite = await prisma.favourite.findUnique({
      where: {
        studentId_propertyId: {
          studentId: req.user.id,
          propertyId,
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
