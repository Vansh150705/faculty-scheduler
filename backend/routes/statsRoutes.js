const express = require('express');
const router = express.Router();
const { getStats, getAnalytics } = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getStats);
router.get('/analytics', authMiddleware, getAnalytics);

module.exports = router;
