const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
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

router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', protect, allowRoles('landlord', 'agent'), createListing);
router.patch('/:id', protect, allowRoles('landlord', 'agent'), updateListing);
router.delete('/:id', protect, allowRoles('landlord', 'agent'), deleteListing);
router.patch('/:id/deactivate', protect, allowRoles('landlord', 'agent'), deactivateListing);
router.patch('/:id/reactivate', protect, allowRoles('landlord', 'agent'), reactivateListing);
router.post('/:id/images', protect, allowRoles('landlord', 'agent'), uploadImages);

module.exports = router;
