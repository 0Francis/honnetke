const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { upload } = require('../config/cloudinary');
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  deactivateListing,
  reactivateListing,
  uploadImages,
} = require('../controllers/listings.controller');

// Public routes (protect is optional — attaches req.user if token present)
router.get('/', (req, res, next) => {
  // Attach token if present, but don't block if missing
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
}, getListings);

router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, next);
  }
  next();
}, getListingById);

// Protected routes — landlord/agent only
router.post('/', protect, allowRoles('landlord', 'agent'), createListing);
router.patch('/:id', protect, allowRoles('landlord', 'agent'), updateListing);
router.delete('/:id', protect, allowRoles('landlord', 'agent'), deleteListing);
router.patch('/:id/deactivate', protect, allowRoles('landlord', 'agent'), deactivateListing);
router.patch('/:id/reactivate', protect, allowRoles('landlord', 'agent'), reactivateListing);
router.post('/:id/images', protect, allowRoles('landlord', 'agent'), upload.array('images', 10), uploadImages);

module.exports = router;
