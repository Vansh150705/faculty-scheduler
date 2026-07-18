const Availability = require('../models/Availability');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { validateTimeRange } = require('../utils/validators');

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
