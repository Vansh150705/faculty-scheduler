const express = require('express');
const router = express.Router();
const {
  joinWaitlist,
  getMyWaitlist,
  leaveWaitlist,
} = require('../controllers/waitlistController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.use(authMiddleware);

router.post('/', authorize('student'), joinWaitlist);
router.get('/mine', authorize('student'), getMyWaitlist);
router.delete('/:id', authorize('student'), leaveWaitlist);

module.exports = router;
