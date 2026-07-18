const express = require('express');
const router = express.Router();
const {
  createAvailability,
  getAvailability,
  deleteAvailability,
} = require('../controllers/availabilityController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.use(authMiddleware);

router.post('/', authorize('faculty'), createAvailability);
router.get('/', getAvailability);
router.get('/:facultyId', getAvailability);
router.delete('/:id', authorize('faculty', 'admin'), deleteAvailability);

module.exports = router;
