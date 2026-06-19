const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const {
  getFavourites,
  addFavourite,
  removeFavourite,
} = require('../controllers/favourites.controller');

router.get('/', protect, allowRoles('student'), getFavourites);
router.post('/', protect, allowRoles('student'), addFavourite);
router.delete('/:id', protect, allowRoles('student'), removeFavourite);

module.exports = router;
