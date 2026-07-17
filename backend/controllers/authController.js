const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { validateRegister, validateLogin } = require('../utils/validators');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, name: user.name }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  title: user.title,
});

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  validateRegister({ name, email, password, role });

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) throw ApiError.conflict('An account with that email already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: role || 'student',
  });

  res.status(201).json({ message: 'User registered successfully', user: publicUser(user) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  validateLogin({ email, password });

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) throw ApiError.badRequest('Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw ApiError.badRequest('Invalid credentials');

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) throw ApiError.notFound('User not found');
  res.json(user);
});

// GET /api/auth/faculty — directory of faculty members for students to browse.
exports.getFaculty = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const query = { role: 'faculty' };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
    ];
  }
  const faculty = await User.find(query)
    .select('name email department title officeLocation bio')
    .sort({ name: 1 });
  res.json(faculty);
});

// PUT /api/auth/profile — update the current user's editable profile fields.
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'department', 'title', 'phone', 'officeLocation', 'bio'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (updates.name !== undefined && !updates.name.trim()) {
    throw ApiError.badRequest('Name cannot be empty');
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');
  if (!user) throw ApiError.notFound('User not found');

  res.json({ message: 'Profile updated', user });
});

// PUT /api/auth/password — change the current user's password.
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('Current and new password are required');
  }
  if (newPassword.length < 6) {
    throw ApiError.badRequest('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password updated successfully' });
});
