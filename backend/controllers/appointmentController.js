const Appointment = require('../models/Appointment');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../utils/mailer');
const notify = require('../utils/notify');
const { promoteWaitlist } = require('./waitlistController');
const { validateTimeRange, toMinutes } = require('../utils/validators');

// Start/end of the calendar day for a given date, used to match all
// appointments that fall on the same day regardless of time component.
const dayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

// Two [start,end) ranges overlap when each starts before the other ends.
const overlaps = (aStart, aEnd, bStart, bEnd) =>
  toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);

// POST /api/appointments — students book an appointment.
exports.createAppointment = asyncHandler(async (req, res) => {
  const { facultyId, date, startTime, endTime, reason, location } = req.body;

  if (!facultyId || !date) throw ApiError.badRequest('facultyId and date are required');
  validateTimeRange(startTime, endTime);

  const bookingDate = new Date(date);
  if (Number.isNaN(bookingDate.getTime())) throw ApiError.badRequest('Invalid date');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (bookingDate < today) throw ApiError.badRequest('Cannot book an appointment in the past');

  const faculty = await User.findById(facultyId);
  if (!faculty || faculty.role !== 'faculty') throw ApiError.notFound('Faculty member not found');

  // Prevent double-booking: reject if this slot overlaps an existing
  // pending/confirmed appointment for the same faculty on the same day.
  const { start, end } = dayBounds(bookingDate);
  const sameDay = await Appointment.find({
    facultyId,
    date: { $gte: start, $lt: end },
    status: { $in: ['pending', 'confirmed'] },
  });
  const clash = sameDay.some((a) => overlaps(startTime, endTime, a.startTime, a.endTime));
  if (clash) {
    throw ApiError.conflict('That time slot is already booked. Please choose another.');
  }

  const appointment = await Appointment.create({
    studentId: req.user.id,
    facultyId,
    date: bookingDate,
    startTime,
    endTime,
    reason: reason || '',
    location: location || '',
    status: 'pending',
  });

  sendEmail(
    faculty.email,
    'New Appointment Request',
    `You have a new appointment request for ${bookingDate.toDateString()} from ${startTime} to ${endTime}.` +
      (reason ? `\nReason: ${reason}` : '') +
      '\nPlease log in to confirm or cancel.'
  );
  notify(
    facultyId,
    'appointment_created',
    `New appointment request from ${req.user.name} on ${bookingDate.toDateString()} at ${startTime}`,
    appointment._id
  );

  res.status(201).json(appointment);
});

// GET /api/appointments — role-scoped list with optional filters.
// Query: status, upcoming=true
exports.getAppointments = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === 'student') query.studentId = req.user.id;
  else if (req.user.role === 'faculty') query.facultyId = req.user.id;
  // admins see everything

  if (req.query.status) query.status = req.query.status;
  if (req.query.upcoming === 'true') {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    query.date = { $gte: now };
  }

  // Optional cap on how many results come back (e.g. ?limit=20). Left off,
  // the full role-scoped list is returned for backward compatibility.
  const limit = Math.min(parseInt(req.query.limit, 10) || 0, 200);

  let cursor = Appointment.find(query)
    .populate('studentId', 'name email')
    .populate('facultyId', 'name email department')
    .sort({ date: 1, startTime: 1 });
  if (limit > 0) cursor = cursor.limit(limit);

  const appointments = await cursor;
  res.json(appointments);
});

// GET /api/appointments/:id — fetch a single appointment the caller is party to.
exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('studentId', 'name email')
    .populate('facultyId', 'name email department');
  if (!appointment) throw ApiError.notFound('Appointment not found');

  const { role, id } = req.user;
  const isParty =
    role === 'admin' ||
    appointment.studentId?._id?.toString() === id ||
    appointment.facultyId?._id?.toString() === id;
  if (!isParty) throw ApiError.forbidden('You do not have access to this appointment');

  res.json(appointment);
});

// PUT /api/appointments/:id/status — faculty/admin confirm, cancel or complete.
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    throw ApiError.badRequest('Status must be confirmed, cancelled or completed');
  }

  const appointment = await Appointment.findById(req.params.id).populate('studentId', 'name email');
  if (!appointment) throw ApiError.notFound('Appointment not found');

  // Faculty can only act on their own appointments; admins can act on any.
  if (req.user.role === 'faculty' && appointment.facultyId.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only manage your own appointments');
  }

  appointment.status = status;
  await appointment.save();

  // Freeing a slot? Let any waitlisted students know it opened up.
  if (status === 'cancelled') {
    promoteWaitlist(appointment.facultyId, appointment.date, appointment.startTime);
  }

  if (appointment.studentId) {
    sendEmail(
      appointment.studentId.email,
      `Appointment ${status}`,
      `Your appointment on ${new Date(appointment.date).toDateString()} from ${appointment.startTime} to ${appointment.endTime} has been ${status}.`
    );
    notify(
      appointment.studentId._id,
      `appointment_${status}`,
      `Your appointment on ${new Date(appointment.date).toDateString()} at ${appointment.startTime} was ${status}`,
      appointment._id
    );
  }

  res.json(appointment);
});

// DELETE /api/appointments/:id — a student cancels their own booking.
exports.cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('facultyId', 'name email');
  if (!appointment) throw ApiError.notFound('Appointment not found');

  if (appointment.studentId.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only cancel your own appointments');
  }
  if (appointment.status === 'cancelled') {
    throw ApiError.badRequest('Appointment is already cancelled');
  }

  appointment.status = 'cancelled';
  await appointment.save();

  // Notify waitlisted students that this slot is free again.
  promoteWaitlist(
    appointment.facultyId._id || appointment.facultyId,
    appointment.date,
    appointment.startTime
  );

  if (appointment.facultyId) {
    sendEmail(
      appointment.facultyId.email,
      'Appointment Cancelled',
      `A student cancelled their appointment on ${new Date(appointment.date).toDateString()} from ${appointment.startTime} to ${appointment.endTime}.`
    );
    notify(
      appointment.facultyId._id,
      'appointment_cancelled',
      `${req.user.name} cancelled their appointment on ${new Date(appointment.date).toDateString()} at ${appointment.startTime}`,
      appointment._id
    );
  }

  res.json(appointment);
});

// PUT /api/appointments/:id/reschedule — a student moves their booking to a
// new date/time, re-running the double-booking check.
exports.rescheduleAppointment = asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.body;
  validateTimeRange(startTime, endTime);

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw ApiError.notFound('Appointment not found');
  if (appointment.studentId.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only reschedule your own appointments');
  }

  const newDate = new Date(date);
  if (Number.isNaN(newDate.getTime())) throw ApiError.badRequest('Invalid date');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (newDate < today) throw ApiError.badRequest('Cannot reschedule to a past date');

  const { start, end } = dayBounds(newDate);
  const sameDay = await Appointment.find({
    _id: { $ne: appointment._id },
    facultyId: appointment.facultyId,
    date: { $gte: start, $lt: end },
    status: { $in: ['pending', 'confirmed'] },
  });
  if (sameDay.some((a) => overlaps(startTime, endTime, a.startTime, a.endTime))) {
    throw ApiError.conflict('That time slot is already booked. Please choose another.');
  }

  appointment.date = newDate;
  appointment.startTime = startTime;
  appointment.endTime = endTime;
  appointment.status = 'pending'; // needs re-confirmation after a change
  await appointment.save();

  notify(
    appointment.facultyId,
    'appointment_rescheduled',
    `${req.user.name} rescheduled an appointment to ${newDate.toDateString()} at ${startTime}`,
    appointment._id
  );

  res.json(appointment);
});
