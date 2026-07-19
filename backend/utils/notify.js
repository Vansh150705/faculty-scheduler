const Notification = require('../models/Notification');

// Fire-and-forget helper to record an in-app notification. Failures are logged
// but never bubble up to break the primary request.
const notify = async (userId, type, message, relatedId = null) => {
  try {
    await Notification.create({ userId, type, message, relatedId });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[notify] error:', err.message);
  }
};

module.exports = notify;
