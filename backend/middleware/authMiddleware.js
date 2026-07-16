const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../utils/ApiError');

// Verifies the Bearer token and attaches the decoded payload to req.user.
const authMiddleware = (req, res, next) => {
  const header = req.header('Authorization');

  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('No token provided, authorization denied'));
  }

  const token = header.slice(7).trim();

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch (err) {
    // Let the central error handler map JWT errors to the right status/message.
    next(err);
  }
};

module.exports = authMiddleware;
