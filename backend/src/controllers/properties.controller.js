const prisma = require('../config/prisma');
const { providerFilter, ownsProperty } = require('../utils/roles');
const { withAvailability } = require('../utils/property');

// Statuses a guest or student is allowed to browse.
const PUBLIC_STATUSES = ['active', 'fully_occupied'];

// Allowed enum values (mirrors schema). Used for light validation.
const PROPERTY_TYPES = [
  'hostel_room', 'shared_room', 'studio', 'bedsitter', 'sq',
  'one_bedroom', 'two_bedroom', 'three_bedroom', 'suite',
  'apartment', 'maisonette', 'other',
];

/* Helper: load a property and confirm the requester owns it. */
async function getOwnedProperty(req, id) {
  const property = await prisma.property.findUnique({
    where: { propertyId: Number(id) },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!property) return null;
  return ownsProperty(req.user, property) ? property : null;
}

/* Helper: record a per-student view and bump weekly analytics. */
async function recordView(propertyId, user) {
  // Weekly analytics bucket (Monday-based week start).
  const now = new Date();
  const weekStart = new Date(now);
  const day = (weekStart.getUTCDay() + 6) % 7; // 0 = Monday
  weekStart.setUTCDate(weekStart.getUTCDate() - day);
  weekStart.setUTCHours(0, 0, 0, 0);

  const tasks = [
    prisma.analytics.upsert({
      where: { propertyId_weekStart: { propertyId, weekStart } },
      update: { viewCount: { increment: 1 } },
      create: { propertyId, weekStart, viewCount: 1 },
    }),
  ];

  // Track per-student visit history for the "recently viewed" feature.
  if (user && user.role === 'student') {
    tasks.push(
      prisma.viewHistory.upsert({
        where: { studentId_propertyId: { studentId: user.id, propertyId } },
        update: {}, // viewedAt auto-updates via @updatedAt
        create: { studentId: user.id, propertyId },
      })
    );
  }

  await Promise.allSettled(tasks);
}

/* ===========================================================
   GET /api/properties  - public list with filters + pagination
   Query: county, area, estate, type, gender, room, minPrice,
          maxPrice, amenities (csv), availability, provider,
          search, status, scope, page, limit
   =========================================================== */
const getProperties = async (req, res, next) => {
  try {
    const {
      county, area, estate, type, gender, room,
      minPrice, maxPrice, amenities, availability, provider,
      search, status = 'active', scope = 'public',
      page = 1, limit = 12,
    } = req.query;

    const where = {};

    if (scope === 'mine' && req.user && (req.user.role === 'landlord' || req.user.role === 'agent')) {
      Object.assign(where, providerFilter(req.user));
      if (status && status !== 'all') where.status = status;
    } else if (req.user && (req.user.role === 'admin')) {
      if (status && status !== 'all') where.status = status;
    } else {
      // Guests and students only ever see public statuses.
      where.status = { in: PUBLIC_STATUSES };
    }

    if (county) where.county = { equals: county, mode: 'insensitive' };
    if (area) where.area = { contains: area, mode: 'insensitive' };
    if (estate) where.estate = { contains: estate, mode: 'insensitive' };
    if (type && PROPERTY_TYPES.includes(type)) where.propertyType = type;
    if (gender) where.genderPreference = gender;
    if (room) where.roomType = room;
    if (provider === 'landlord') where.landlordId = { not: null };
    if (provider === 'agent') where.agentId = { not: null };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (amenities) {
      const list = String(amenities).split(',').map(a => a.trim()).filter(Boolean);
      if (list.length) where.amenities = { hasEvery: list };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { nearestCampus: { contains: search, mode: 'insensitive' } },
        { area: { contains: search, mode: 'insensitive' } },
        { estate: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const take = Math.min(50, parseInt(limit));

    let [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: { images: { take: 1, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.property.count({ where }),
    ]);

    properties = properties.map(withAvailability);

    // Availability filter is applied post-query (derived field).
    if (availability) {
      properties = properties.filter(p => p.availability === availability);
    }

    res.json({
      properties,
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

/* ===========================================================
   GET /api/properties/:id  - single property detail
   =========================================================== */
const getPropertyById = async (req, res, next) => {
  try {
    const property = await prisma.property.findUnique({
      where: { propertyId: Number(req.params.id) },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        landlord: { select: { fullName: true, phoneNumber: true } },
        agent: { select: { fullName: true, phoneNumber: true } },
      },
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const isOwner = ownsProperty(req.user, property);
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin && !PUBLIC_STATUSES.includes(property.status)) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Record the view for non-owners (fire and forget).
    if (!isOwner) {
      recordView(property.propertyId, req.user).catch(() => {});
    }

    res.json(withAvailability(property));
  } catch (err) {
    next(err);
  }
};

/* ===========================================================
   POST /api/properties  - create (landlord/agent only)
   Body supports saveDraft to keep it as a draft.
   =========================================================== */
const createProperty = async (req, res, next) => {
  try {
    const {
      title, description, propertyType, price, deposit,
      genderPreference, roomType, amenities, rules, capacity,
      county, area, estate, nearestCampus, address,
      latitude, longitude, mapLink, saveDraft,
    } = req.body;

    if (!title || !price || !county || !area) {
      return res.status(400).json({
        message: 'Missing required fields: title, price, county, area',
      });
    }

    const property = await prisma.property.create({
      data: {
        ...providerFilter(req.user),
        title,
        description: description || null,
        propertyType: PROPERTY_TYPES.includes(propertyType) ? propertyType : 'other',
        price: parseFloat(price),
        deposit: deposit != null ? parseFloat(deposit) : null,
        genderPreference: genderPreference || null,
        roomType: roomType || null,
        amenities: Array.isArray(amenities) ? amenities : [],
        rules: Array.isArray(rules) ? rules : [],
        capacity: capacity != null ? Math.max(1, parseInt(capacity)) : 1,
        county,
        area,
        estate: estate || null,
        nearestCampus: nearestCampus || null,
        address: address || null,
        latitude: latitude != null ? parseFloat(latitude) : null,
        longitude: longitude != null ? parseFloat(longitude) : null,
        mapLink: mapLink || null,
        status: saveDraft ? 'draft' : 'pending_approval',
      },
    });

    res.status(201).json({
      message: saveDraft
        ? 'Draft saved.'
        : 'Property created. It will be reviewed by an admin before going live.',
      property,
    });
  } catch (err) {
    next(err);
  }
};

/* ===========================================================
   PATCH /api/properties/:id  - update (owner only)
   =========================================================== */
const updateProperty = async (req, res, next) => {
  try {
    const property = await getOwnedProperty(req, req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found or not owned by you' });
    }

    const allowed = [
      'title', 'description', 'propertyType', 'price', 'deposit',
      'genderPreference', 'roomType', 'amenities', 'rules', 'capacity',
      'county', 'area', 'estate', 'nearestCampus', 'address',
      'latitude', 'longitude', 'mapLink',
    ];

    const data = {};
    for (const key of allowed) {
      if (req.body[key] === undefined) continue;
      if (key === 'price' || key === 'deposit') data[key] = parseFloat(req.body[key]);
      else if (key === 'capacity') data.capacity = Math.max(1, parseInt(req.body.capacity));
      else if (key === 'latitude' || key === 'longitude') data[key] = parseFloat(req.body[key]);
      else if (key === 'amenities' || key === 'rules') data[key] = Array.isArray(req.body[key]) ? req.body[key] : [];
      else if (key === 'propertyType') data.propertyType = PROPERTY_TYPES.includes(req.body[key]) ? req.body[key] : property.propertyType;
      else data[key] = req.body[key];
    }

    // Editing a rejected property re-submits it for approval.
    if (property.status === 'rejected') {
      data.status = 'pending_approval';
      data.rejectionReason = null;
    }

    const updated = await prisma.property.update({
      where: { propertyId: property.propertyId },
      data,
    });

    res.json({ message: 'Property updated', property: updated });
  } catch (err) {
    next(err);
  }
};

/* ===========================================================
   DELETE /api/properties/:id  - hard delete (owner only)
   =========================================================== */
const deleteProperty = async (req, res, next) => {
  try {
    const property = await getOwnedProperty(req, req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found or not owned by you' });
    }
    await prisma.property.delete({ where: { propertyId: property.propertyId } });
    res.json({ message: 'Property deleted' });
  } catch (err) {
    next(err);
  }
};

/* ===========================================================
   PATCH /api/properties/:id/archive  - owner archives a property
   =========================================================== */
const archiveProperty = async (req, res, next) => {
  try {
    const property = await getOwnedProperty(req, req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found or not owned by you' });
    }
    const updated = await prisma.property.update({
      where: { propertyId: property.propertyId },
      data: { status: 'archived' },
    });
    res.json({ message: 'Property archived', property: updated });
  } catch (err) {
    next(err);
  }
};

/* ===========================================================
   PATCH /api/properties/:id/submit  - draft/archived -> pending
   =========================================================== */
const submitProperty = async (req, res, next) => {
  try {
    const property = await getOwnedProperty(req, req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found or not owned by you' });
    }
    const updated = await prisma.property.update({
      where: { propertyId: property.propertyId },
      data: { status: 'pending_approval', rejectionReason: null },
    });
    res.json({ message: 'Property submitted for review', property: updated });
  } catch (err) {
    next(err);
  }
};

/* ===========================================================
   POST /api/properties/:id/images  - upload via Cloudinary
   =========================================================== */
const uploadImages = async (req, res, next) => {
  try {
    const property = await getOwnedProperty(req, req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found or not owned by you' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const baseOrder = property.images.length;
    const records = await Promise.all(
      req.files.map((file, index) =>
        prisma.propertyImage.create({
          data: {
            propertyId: property.propertyId,
            imageUrl: file.path,
            isPrimary: baseOrder === 0 && index === 0,
            sortOrder: baseOrder + index,
          },
        })
      )
    );

    res.status(201).json({ message: `${records.length} image(s) uploaded`, images: records });
  } catch (err) {
    next(err);
  }
};

/* ===========================================================
   DELETE /api/properties/:id/images/:imageId  - remove an image
   =========================================================== */
const deleteImage = async (req, res, next) => {
  try {
    const property = await getOwnedProperty(req, req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found or not owned by you' });
    }
    const image = property.images.find(i => i.imageId === Number(req.params.imageId));
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await prisma.propertyImage.delete({ where: { imageId: image.imageId } });

    // If the primary image was removed, promote the next one.
    if (image.isPrimary) {
      const next = property.images.find(i => i.imageId !== image.imageId);
      if (next) {
        await prisma.propertyImage.update({
          where: { imageId: next.imageId },
          data: { isPrimary: true },
        });
      }
    }

    res.json({ message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
};

/* ===========================================================
   PATCH /api/properties/:id/images/:imageId/primary
   =========================================================== */
const setPrimaryImage = async (req, res, next) => {
  try {
    const property = await getOwnedProperty(req, req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found or not owned by you' });
    }
    const image = property.images.find(i => i.imageId === Number(req.params.imageId));
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await prisma.$transaction([
      prisma.propertyImage.updateMany({
        where: { propertyId: property.propertyId },
        data: { isPrimary: false },
      }),
      prisma.propertyImage.update({
        where: { imageId: image.imageId },
        data: { isPrimary: true },
      }),
    ]);

    res.json({ message: 'Primary image updated' });
  } catch (err) {
    next(err);
  }
};

/* ===========================================================
   PATCH /api/properties/:id/images/reorder
   Body: { order: [imageId, imageId, ...] }
   =========================================================== */
const reorderImages = async (req, res, next) => {
  try {
    const property = await getOwnedProperty(req, req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found or not owned by you' });
    }
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ message: 'order must be an array of image ids' });
    }
    const ownIds = new Set(property.images.map(i => i.imageId));
    const updates = order
      .filter(id => ownIds.has(Number(id)))
      .map((id, index) =>
        prisma.propertyImage.update({
          where: { imageId: Number(id) },
          data: { sortOrder: index },
        })
      );
    await prisma.$transaction(updates);
    res.json({ message: 'Images reordered' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  archiveProperty,
  submitProperty,
  uploadImages,
  deleteImage,
  setPrimaryImage,
  reorderImages,
};
