const express = require('express');
const router = express.Router();
const { createAvailability, getAvailability, deleteAvailability } = require('../controllers/availabilityController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createAvailability);
router.get('/', authMiddleware, getAvailability);
router.get('/:facultyId', authMiddleware, getAvailability);
router.delete('/:id', authMiddleware, deleteAvailability);

module.exports = router;
