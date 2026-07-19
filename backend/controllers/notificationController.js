const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// GET /api/notifications — current user's notifications, newest first.
// Also returns the unread count so the client can render a badge in one call.
exports.getNotifications = asyncHandler(async (req, res) => {
  const [notifications, unread] = await Promise.all([
    Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50),
    Notification.countDocuments({ userId: req.user.id, read: false }),
  ]);
  res.json({ notifications, unread });
});

// PUT /api/notifications/:id/read — mark a single notification as read.
exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { read: true },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  res.json(notification);
});

// PUT /api/notifications/read-all — mark every notification as read.
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
  res.json({ message: 'All notifications marked as read' });
});

// DELETE /api/notifications — clear the current user's notifications.
exports.clearAll = asyncHandler(async (req, res) => {
  const { deletedCount } = await Notification.deleteMany({ userId: req.user.id });
  res.json({ message: 'Notifications cleared', deleted: deletedCount });
});
