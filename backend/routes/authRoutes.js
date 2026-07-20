const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getFaculty,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const createRateLimiter = require('../middleware/rateLimiter');

// Throttle credential endpoints to slow down brute-force attempts.
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many attempts. Please try again in a few minutes.',
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', authMiddleware, getMe);
router.get('/faculty', authMiddleware, getFaculty);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, changePassword);

module.exports = router;
