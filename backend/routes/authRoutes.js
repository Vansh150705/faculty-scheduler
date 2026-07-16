const express = require('express');
const router = express.Router();
const { register, login, getMe, getFaculty } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.get('/faculty', authMiddleware, getFaculty);

module.exports = router;
