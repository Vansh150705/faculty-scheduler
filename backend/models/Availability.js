const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  startTime: { type: String, required: true }, // Format HH:MM (e.g., "09:00")
  endTime: { type: String, required: true }, // Format HH:MM (e.g., "17:00")
});

module.exports = mongoose.model('Availability', availabilitySchema);
