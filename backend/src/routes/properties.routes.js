const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { upload } = require('../config/cloudinary');
const {
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
} = require('../controllers/properties.controller');

// Attaches req.user if a token is present, but does not block guests.
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
};

// Public (guest-friendly) routes
router.get('/', optionalAuth, getProperties);
router.get('/:id', optionalAuth, getPropertyById);

// Provider-only routes
router.post('/', protect, allowRoles('landlord', 'agent'), createProperty);
router.patch('/:id', protect, allowRoles('landlord', 'agent'), updateProperty);
router.delete('/:id', protect, allowRoles('landlord', 'agent'), deleteProperty);
router.patch('/:id/archive', protect, allowRoles('landlord', 'agent'), archiveProperty);
router.patch('/:id/submit', protect, allowRoles('landlord', 'agent'), submitProperty);

// Image management
router.post('/:id/images', protect, allowRoles('landlord', 'agent'), upload.array('images', 10), uploadImages);
router.patch('/:id/images/reorder', protect, allowRoles('landlord', 'agent'), reorderImages);
router.patch('/:id/images/:imageId/primary', protect, allowRoles('landlord', 'agent'), setPrimaryImage);
router.delete('/:id/images/:imageId', protect, allowRoles('landlord', 'agent'), deleteImage);

module.exports = router;
