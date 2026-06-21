const prisma = require('../config/prisma');
const { cloudinary, upload } = require('../config/cloudinary');

/* ── Helper: resolve the provider's table + id field from JWT role ── */
function providerFilter(req) {
  if (req.user.role === 'landlord') return { landlordId: req.user.id };
  if (req.user.role === 'agent') return { agentId: req.user.id };
  return {};
}

/* ── Helper: check listing ownership ── */
async function getOwnedListing(req, id) {
  const listing = await prisma.listing.findUnique({
    where: { listingId: Number(id) },
    include: { images: true },
  });
  if (!listing) return null;
  const isOwner =
    (req.user.role === 'landlord' && listing.landlordId === req.user.id) ||
    (req.user.role === 'agent' && listing.agentId === req.user.id);
  if (!isOwner) return null;
  return listing;
}

/* ═══════════════════════════════════════════════════════
   GET /api/listings  — public list with filters + pagination
   Query: county, area, type, gender, room, minPrice, maxPrice,
          status (default active), page, limit, search
   ═══════════════════════════════════════════════════════ */
const getListings = async (req, res, next) => {
  try {
    const {
      county, area, type, gender, room,
      minPrice, maxPrice, search,
      status = 'active',
      scope = 'public',
      page = 1,
      limit = 12,
    } = req.query;

    const where = {};

    // If a provider requests their own listings, filter by provider
    if (scope === 'mine' && req.user && (req.user.role === 'landlord' || req.user.role === 'agent')) {
      Object.assign(where, providerFilter(req));
      if (status && status !== 'all') where.status = status;
    } else if (req.user) {
      // Authenticated user browsing — can see statuses if they pass status=all
      if (status && status !== 'all') where.status = status;
    } else {
      where.status = 'active';
    }

    if (county) where.county = { equals: county, mode: 'insensitive' };
    if (area) where.area = { contains: area, mode: 'insensitive' };
    if (type) where.propertyType = type;
    if (gender) where.genderPreference = gender;
    if (room) where.roomType = room;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { nearestCampus: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const take = Math.min(50, parseInt(limit));

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { images: { take: 1, orderBy: { isPrimary: 'desc' } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      pagination: {
        page: parseInt(page),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   GET /api/listings/:id  — single listing detail (public)
   ═══════════════════════════════════════════════════════ */
const getListingById = async (req, res, next) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { listingId: Number(req.params.id) },
      include: { images: { orderBy: { isPrimary: 'desc' } } },
    });

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Non-owners can only see active listings
    const isOwner =
      req.user &&
      ((req.user.role === 'landlord' && listing.landlordId === req.user.id) ||
        (req.user.role === 'agent' && listing.agentId === req.user.id));

    if (!isOwner && listing.status !== 'active') {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   POST /api/listings  — create (landlord/agent only)
   Body: title, description, propertyType, price, genderPreference,
         roomType, amenities[], county, area, nearestCampus, address
   ═══════════════════════════════════════════════════════ */
const createListing = async (req, res, next) => {
  try {
    const {
      title, description, propertyType, price,
      genderPreference, roomType, amenities,
      county, area, nearestCampus, address,
    } = req.body;

    if (!title || !price || !county || !area) {
      return res.status(400).json({
        message: 'Missing required fields: title, price, county, area',
      });
    }

    const listing = await prisma.listing.create({
      data: {
        ...providerFilter(req),
        title,
        description: description || null,
        propertyType: propertyType || null,
        price: parseFloat(price),
        genderPreference: genderPreference || null,
        roomType: roomType || null,
        amenities: Array.isArray(amenities) ? amenities : [],
        county,
        area,
        nearestCampus: nearestCampus || null,
        address: address || null,
        status: 'pending',
      },
    });

    res.status(201).json({
      message: 'Listing created. It will be reviewed by an admin before going live.',
      listing,
    });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/listings/:id  — update (owner only)
   ═══════════════════════════════════════════════════════ */
const updateListing = async (req, res, next) => {
  try {
    const listing = await getOwnedListing(req, req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found or not owned by you' });
    }

    const allowed = [
      'title', 'description', 'propertyType', 'price',
      'genderPreference', 'roomType', 'amenities',
      'county', 'area', 'nearestCampus', 'address',
    ];

    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === 'price') data.price = parseFloat(req.body.price);
        else if (key === 'amenities') data.amenities = Array.isArray(req.body.amenities) ? req.body.amenities : data.amenities;
        else data[key] = req.body[key];
      }
    }

    // If listing was declined, re-submitting puts it back to pending
    if (listing.status === 'inactive' || listing.status === 'blocked') {
      data.status = 'pending';
      data.declineReason = null;
    }

    const updated = await prisma.listing.update({
      where: { listingId: listing.listingId },
      data,
    });

    res.json({ message: 'Listing updated', listing: updated });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   DELETE /api/listings/:id  — hard delete (owner only)
   ═══════════════════════════════════════════════════════ */
const deleteListing = async (req, res, next) => {
  try {
    const listing = await getOwnedListing(req, req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found or not owned by you' });
    }

    await prisma.listing.delete({ where: { listingId: listing.listingId } });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/listings/:id/deactivate  — owner sets inactive
   ═══════════════════════════════════════════════════════ */
const deactivateListing = async (req, res, next) => {
  try {
    const listing = await getOwnedListing(req, req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found or not owned by you' });
    }

    const updated = await prisma.listing.update({
      where: { listingId: listing.listingId },
      data: { status: 'inactive' },
    });

    res.json({ message: 'Listing deactivated', listing: updated });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   PATCH /api/listings/:id/reactivate  — owner puts back to pending
   ═══════════════════════════════════════════════════════ */
const reactivateListing = async (req, res, next) => {
  try {
    const listing = await getOwnedListing(req, req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found or not owned by you' });
    }

    const updated = await prisma.listing.update({
      where: { listingId: listing.listingId },
      data: { status: 'pending', declineReason: null },
    });

    res.json({ message: 'Listing re-submitted for review', listing: updated });
  } catch (err) {
    next(err);
  }
};

/* ═══════════════════════════════════════════════════════
   POST /api/listings/:id/images  — upload images via Cloudinary
   Expects multipart/form-data with field "images" (up to 10 files)
   ═══════════════════════════════════════════════════════ */
const uploadImages = async (req, res, next) => {
  try {
    const listing = await getOwnedListing(req, req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found or not owned by you' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Create ListingImage records from Cloudinary URLs
    const imageRecords = await Promise.all(
      req.files.map((file, index) =>
        prisma.listingImage.create({
          data: {
            listingId: listing.listingId,
            imageUrl: file.path,
            isPrimary: index === 0 && listing.images.length === 0,
          },
        })
      )
    );

    res.status(201).json({
      message: `${imageRecords.length} image(s) uploaded`,
      images: imageRecords,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  deactivateListing,
  reactivateListing,
  uploadImages,
};
