const ApiError = require('./ApiError');

// Small, dependency-free validation helpers. Each collects human-readable
// messages and throws a single 400 ApiError so the client can show them all.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM 24-hour

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

// Convert "HH:MM" to minutes-since-midnight for easy comparison.
const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const validateRegister = ({ name, email, password, role }) => {
  const errors = [];
  if (!isNonEmptyString(name)) errors.push('Name is required');
  if (!isNonEmptyString(email) || !EMAIL_RE.test(email)) errors.push('A valid email is required');
  if (!isNonEmptyString(password) || password.length < 6)
    errors.push('Password must be at least 6 characters');
  if (role && !['student', 'faculty', 'admin'].includes(role))
    errors.push('Role must be student, faculty or admin');
  if (errors.length) throw ApiError.badRequest('Validation failed', errors);
};

const validateLogin = ({ email, password }) => {
  const errors = [];
  if (!isNonEmptyString(email)) errors.push('Email is required');
  if (!isNonEmptyString(password)) errors.push('Password is required');
  if (errors.length) throw ApiError.badRequest('Validation failed', errors);
};

const validateTimeRange = (startTime, endTime) => {
  const errors = [];
  if (!TIME_RE.test(startTime || '')) errors.push('Start time must be in HH:MM format');
  if (!TIME_RE.test(endTime || '')) errors.push('End time must be in HH:MM format');
  if (!errors.length && toMinutes(endTime) <= toMinutes(startTime))
    errors.push('End time must be after start time');
  if (errors.length) throw ApiError.badRequest('Validation failed', errors);
};

module.exports = {
  EMAIL_RE,
  TIME_RE,
  isNonEmptyString,
  toMinutes,
  validateRegister,
  validateLogin,
  validateTimeRange,
};
