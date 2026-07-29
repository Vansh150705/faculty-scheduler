const Waitlist = require('../models/Waitlist');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../utils/mailer');
const notify = require('../utils/notify');
const { validateTimeRange } = require('../utils/validators');

const dayBounds = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

// POST /api/waitlist — a student joins the waitlist for a taken slot.
exports.joinWaitlist = asyncHandler(async (req, res) => {
  const { facultyId, date, startTime, endTime, reason } = req.body;
  if (!facultyId || !date) throw ApiError.badRequest('facultyId and date are required');
  validateTimeRange(startTime, endTime);

  const faculty = await User.findById(facultyId);
  if (!faculty || faculty.role !== 'faculty') throw ApiError.notFound('Faculty member not found');

  const existing = await Waitlist.findOne({
    studentId: req.user.id,
    facultyId,
    date: { $gte: dayBounds(date).start, $lt: dayBounds(date).end },
    startTime,
    status: { $in: ['waiting', 'notified'] },
  });
  if (existing) throw ApiError.conflict("You're already on the waitlist for that slot");

  const entry = await Waitlist.create({
    studentId: req.user.id,
    facultyId,
    date: new Date(date),
    startTime,
    endTime,
    reason: reason || '',
  });

  res.status(201).json(entry);
});

// GET /api/waitlist/mine — the student's active waitlist entries.
exports.getMyWaitlist = asyncHandler(async (req, res) => {
  const entries = await Waitlist.find({
    studentId: req.user.id,
    status: { $in: ['waiting', 'notified'] },
  })
    .populate('facultyId', 'name department')
    .sort({ date: 1, startTime: 1 });
  res.json(entries);
});

// GET /api/waitlist/faculty — students currently waiting on this faculty's slots.
exports.getFacultyWaitlist = asyncHandler(async (req, res) => {
  const entries = await Waitlist.find({
    facultyId: req.user.id,
    status: { $in: ['waiting', 'notified'] },
  })
    .populate('studentId', 'name email')
    .sort({ date: 1, startTime: 1 });
  res.json(entries);
});

// DELETE /api/waitlist/:id — leave the waitlist.
exports.leaveWaitlist = asyncHandler(async (req, res) => {
  const entry = await Waitlist.findById(req.params.id);
  if (!entry) throw ApiError.notFound('Waitlist entry not found');
  if (entry.studentId.toString() !== req.user.id) {
    throw ApiError.forbidden('You can only leave your own waitlist entries');
  }
  await entry.deleteOne();
  res.json({ message: 'Removed from waitlist' });
});

// Called from the appointment flow when a slot is freed: notify every student
// waiting on that exact faculty/date/time that it has opened up.
exports.promoteWaitlist = async (facultyId, date, startTime) => {
  try {
    const { start, end } = dayBounds(date);
    const entries = await Waitlist.find({
      facultyId,
      date: { $gte: start, $lt: end },
      startTime,
      status: 'waiting',
    }).populate('studentId', 'name email');

    await Promise.all(
      entries.map(async (entry) => {
        entry.status = 'notified';
        await entry.save();
        const when = `${new Date(entry.date).toDateString()} at ${entry.startTime}`;
        notify(
          entry.studentId._id,
          'system',
          `A waitlisted slot just opened up: ${when}. Book it before someone else does!`,
          entry._id
        );
        if (entry.studentId.email) {
          sendEmail(
            entry.studentId.email,
            'A waitlisted slot opened up',
            `Good news! The slot on ${when} you were waiting for is now available. Log in to book it.`
          );
        }
      })
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[waitlist] promotion error:', err.message);
  }
};
