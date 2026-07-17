const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // HH:MM
    endTime: { type: String, required: true }, // HH:MM
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    reason: { type: String, trim: true, default: '', maxlength: 300 },
    location: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

// Common lookups: a faculty member's schedule for a day, and a student's list.
appointmentSchema.index({ facultyId: 1, date: 1 });
appointmentSchema.index({ studentId: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
