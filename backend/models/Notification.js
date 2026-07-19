const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['appointment_created', 'appointment_confirmed', 'appointment_cancelled', 'appointment_completed', 'appointment_rescheduled', 'system'],
      default: 'system',
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    // Optional link back to the related document (e.g. an appointment id).
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
