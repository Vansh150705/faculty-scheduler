const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, updateAppointmentStatus } = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createAppointment);
router.get('/', authMiddleware, getAppointments);
router.put('/:id/status', authMiddleware, updateAppointmentStatus);

module.exports = router;
