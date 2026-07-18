const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment,
} = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');

router.use(authMiddleware);

router.post('/', authorize('student'), createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/status', authorize('faculty', 'admin'), updateAppointmentStatus);
router.put('/:id/reschedule', authorize('student'), rescheduleAppointment);
router.delete('/:id', authorize('student'), cancelAppointment);

module.exports = router;
