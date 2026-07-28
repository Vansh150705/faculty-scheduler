const mongoose = require('mongoose');

// A student's request to be notified if a currently-taken slot frees up.
const waitlistSchema = new mongoose.Schema(
  {
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // HH:MM
    endTime: { type: String, required: true }, // HH:MM
    reason: { type: String, trim: true, default: '', maxlength: 300 },
    status: {
      type: String,
      enum: ['waiting', 'notified', 'converted', 'cancelled'],
      default: 'waiting',
    },
  },
  { timestamps: true }
);

// Fast lookup when a slot opens up, and a guard against duplicate entries.
waitlistSchema.index({ facultyId: 1, date: 1, startTime: 1 });
waitlistSchema.index(
  { studentId: 1, facultyId: 1, date: 1, startTime: 1 },
  { unique: true }
);

module.exports = mongoose.model('Waitlist', waitlistSchema);
