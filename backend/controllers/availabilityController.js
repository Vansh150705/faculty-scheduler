const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { validateTimeRange, toMinutes } = require('../utils/validators');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const pad = (n) => String(n).padStart(2, '0');
const fromMinutes = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

// POST /api/availability — faculty add a weekly time slot. (role enforced in route)
exports.createAvailability = asyncHandler(async (req, res) => {
  const { dayOfWeek, startTime, endTime, slotDuration } = req.body;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (!days.includes(dayOfWeek)) throw ApiError.badRequest('Invalid day of week');
  validateTimeRange(startTime, endTime);

  const availability = await Availability.create({
    facultyId: req.user.id,
    dayOfWeek,
    startTime,
    endTime,
    ...(slotDuration ? { slotDuration } : {}),
  });

  res.status(201).json(availability);
});

// GET /api/availability  or  /api/availability/:facultyId
exports.getAvailability = asyncHandler(async (req, res) => {
  const query = {};
  if (req.params.facultyId) query.facultyId = req.params.facultyId;

  const availability = await Availability.find(query)
    .populate('facultyId', 'name email department title')
    .sort({ dayOfWeek: 1, startTime: 1 });

  res.json(availability);
});

// DELETE /api/availability/:id — faculty remove their own slot (admin: any).
exports.deleteAvailability = asyncHandler(async (req, res) => {
  const availability = await Availability.findById(req.params.id);
  if (!availability) throw ApiError.notFound('Availability not found');

  if (req.user.role === 'faculty' && availability.facultyId.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only delete your own availability');
  }

  await availability.deleteOne();
  res.json({ message: 'Availability deleted successfully' });
});

// GET /api/availability/:facultyId/slots?date=YYYY-MM-DD
// Expands a faculty member's weekly availability for the given date into
// concrete bookable slots and marks the ones already taken.
exports.getSlots = asyncHandler(async (req, res) => {
  const { facultyId } = req.params;
  const { date } = req.query;
  if (!date) throw ApiError.badRequest('A date query parameter is required');

  const target = new Date(date);
  if (Number.isNaN(target.getTime())) throw ApiError.badRequest('Invalid date');
  const dayName = DAY_NAMES[target.getDay()];

  const windows = await Availability.find({ facultyId, dayOfWeek: dayName });

  // Existing pending/confirmed appointments on that day, to flag taken slots.
  const start = new Date(target);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const taken = await Appointment.find({
    facultyId,
    date: { $gte: start, $lt: end },
    status: { $in: ['pending', 'confirmed'] },
  }).select('startTime endTime');
  const takenRanges = taken.map((a) => [toMinutes(a.startTime), toMinutes(a.endTime)]);

  const slots = [];
  windows.forEach((w) => {
    const step = w.slotDuration || 30;
    for (let t = toMinutes(w.startTime); t + step <= toMinutes(w.endTime); t += step) {
      const isTaken = takenRanges.some(([s, e]) => t < e && s < t + step);
      slots.push({ startTime: fromMinutes(t), endTime: fromMinutes(t + step), booked: isTaken });
    }
  });
  slots.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  res.json({ date, dayOfWeek: dayName, slots });
});
