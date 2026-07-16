const ApiError = require('../utils/ApiError');

// Role-based guard factory. Use after authMiddleware, e.g.
//   router.post('/', authMiddleware, authorize('faculty'), handler)
// Passing no roles simply requires an authenticated user.
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  if (roles.length > 0 && !roles.includes(req.user.role)) {
    return next(
      ApiError.forbidden(`This action requires one of the following roles: ${roles.join(', ')}`)
    );
  }
  next();
};

module.exports = authorize;
