const Appointment = require('../models/Appointment');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Set up nodemailer transporter
// Note: In production, these should be environment variables.
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email provider
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'password'
  }
});

// Helper function to send email
const sendEmail = async (to, subject, text) => {
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
      });
      console.log(`Email sent to ${to}`);
    } else {
      console.log(`[Email Mock] To: ${to} | Subject: ${subject} | Body: ${text}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.createAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Only students can book appointments.' });
    }

    const { facultyId, date, startTime, endTime } = req.body;

    const newAppointment = new Appointment({
      studentId: req.user.id,
      facultyId,
      date,
      startTime,
      endTime,
      status: 'pending'
    });

    await newAppointment.save();

    // Fetch faculty details to send email
    const faculty = await User.findById(facultyId);
    if (faculty) {
      sendEmail(
        faculty.email, 
        'New Appointment Request', 
        `You have a new appointment request for ${new Date(date).toDateString()} from ${startTime} to ${endTime}. Please log in to confirm or cancel.`
      );
    }

    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating appointment', error: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    } else if (req.user.role === 'faculty') {
      query.facultyId = req.user.id;
    }

    const appointments = await Appointment.find(query)
      .populate('studentId', 'name email')
      .populate('facultyId', 'name email')
      .sort({ date: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { id } = req.params;
    const { status } = req.body; // 'confirmed' or 'cancelled'

    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true })
      .populate('studentId', 'name email');

    if (appointment && appointment.studentId) {
      sendEmail(
        appointment.studentId.email,
        `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your appointment on ${new Date(appointment.date).toDateString()} from ${appointment.startTime} to ${appointment.endTime} has been ${status}.`
      );
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};
