const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/admin/users — list users with optional role filter and search.
exports.getUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(query).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// PUT /api/admin/users/:id/role — change a user's role.
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['student', 'faculty', 'admin'].includes(role)) {
    throw ApiError.badRequest('Invalid role');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select(
    '-password'
  );
  if (!user) throw ApiError.notFound('User not found');
  res.json({ message: 'Role updated', user });
});

// DELETE /api/admin/users/:id — remove a user and their related records.
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw ApiError.badRequest('You cannot delete your own account');
  }
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');

  await Promise.all([
    Appointment.deleteMany({ $or: [{ facultyId: user._id }, { studentId: user._id }] }),
    Availability.deleteMany({ facultyId: user._id }),
    Notification.deleteMany({ userId: user._id }),
    user.deleteOne(),
  ]);

  res.json({ message: 'User and related records deleted' });
});
