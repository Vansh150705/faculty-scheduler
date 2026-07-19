const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markRead,
  markAllRead,
  clearAll,
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getNotifications);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);
router.delete('/', clearAll);

module.exports = router;
