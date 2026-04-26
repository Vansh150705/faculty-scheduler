const Availability = require('../models/Availability');

exports.createAvailability = async (req, res) => {
  try {
    // Only faculty can set availability
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Only faculty can perform this action.' });
    }

    const { dayOfWeek, startTime, endTime } = req.body;
    
    const newAvailability = new Availability({
      facultyId: req.user.id,
      dayOfWeek,
      startTime,
      endTime
    });

    await newAvailability.save();
    res.status(201).json(newAvailability);
  } catch (error) {
    res.status(500).json({ message: 'Error creating availability', error: error.message });
  }
};

exports.getAvailability = async (req, res) => {
  try {
    const { facultyId } = req.params;
    let query = {};
    if (facultyId) {
      query.facultyId = facultyId;
    }
    
    const availability = await Availability.find(query).populate('facultyId', 'name email');
    res.status(200).json(availability);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching availability', error: error.message });
  }
};

exports.deleteAvailability = async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { id } = req.params;
    await Availability.findByIdAndDelete(id);
    res.status(200).json({ message: 'Availability deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting availability', error: error.message });
  }
};
