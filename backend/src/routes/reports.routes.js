const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { createReport } = require('../controllers/reports.controller');

router.post('/', protect, allowRoles('student'), createReport);

module.exports = router;
