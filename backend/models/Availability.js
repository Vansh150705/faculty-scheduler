const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: { type: String, required: true }, // Format HH:MM (e.g., "09:00")
    endTime: { type: String, required: true }, // Format HH:MM (e.g., "17:00")
    slotDuration: { type: Number, default: 30, min: 10, max: 240 }, // minutes per bookable slot
  },
  { timestamps: true }
);

// A faculty member should not have two identical slots on the same day.
availabilitySchema.index(
  { facultyId: 1, dayOfWeek: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

module.exports = mongoose.model('Availability', availabilitySchema);
