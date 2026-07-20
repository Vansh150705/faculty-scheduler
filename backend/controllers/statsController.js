const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Turn an aggregation result [{ _id, count }] into a { key: count } map with
// every expected key present (defaulting to 0).
const toCounts = (rows, keys) => {
  const base = Object.fromEntries(keys.map((k) => [k, 0]));
  rows.forEach((r) => {
    base[r._id] = r.count;
  });
  return base;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// GET /api/stats — analytics tailored to the caller's role.
exports.getStats = asyncHandler(async (req, res) => {
  const { role, id } = req.user;

  if (role === 'admin') return res.json(await adminStats());

  const match =
    role === 'faculty'
      ? { facultyId: new mongoose.Types.ObjectId(id) }
      : { studentId: new mongoose.Types.ObjectId(id) };

  const [byStatus, total, upcoming, byDayRows] = await Promise.all([
    Appointment.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Appointment.countDocuments(match),
    Appointment.countDocuments({
      ...match,
      date: { $gte: startOfToday() },
      status: { $in: ['pending', 'confirmed'] },
    }),
    Appointment.aggregate([
      { $match: match },
      { $group: { _id: { $dayOfWeek: '$date' }, count: { $sum: 1 } } },
    ]),
  ]);

  const byDay = DAY_LABELS.map((label, i) => {
    const row = byDayRows.find((r) => r._id === i + 1);
    return { day: label, count: row ? row.count : 0 };
  });

  const result = {
    role,
    total,
    upcoming,
    byStatus: toCounts(byStatus, STATUSES),
    byDay,
  };

  if (role === 'faculty') {
    result.availabilitySlots = await Availability.countDocuments({ facultyId: id });
  }

  res.json(result);
});

// Global analytics for administrators.
const adminStats = async () => {
  const [usersByRole, apptByStatus, totalUsers, totalAppointments, topFaculty] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.countDocuments(),
    Appointment.countDocuments(),
    Appointment.aggregate([
      { $group: { _id: '$facultyId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'faculty' } },
      { $unwind: '$faculty' },
      { $project: { _id: 0, name: '$faculty.name', department: '$faculty.department', count: 1 } },
    ]),
  ]);

  return {
    role: 'admin',
    totalUsers,
    totalAppointments,
    usersByRole: toCounts(usersByRole, ['student', 'faculty', 'admin']),
    byStatus: toCounts(apptByStatus, STATUSES),
    topFaculty,
  };
};
