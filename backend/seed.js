/*
 * Seed script — populates the database with demo users, availability and
 * appointments so the app can be explored immediately.
 *
 * Usage:  node seed.js        (from the backend folder, with a running MongoDB)
 *
 * All demo accounts share the password:  password123
 */
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const config = require('./config/env');

const User = require('./models/User');
const Availability = require('./models/Availability');
const Appointment = require('./models/Appointment');
const Notification = require('./models/Notification');

const PASSWORD = 'password123';

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
};

async function seed() {
  await mongoose.connect(config.mongoUri);
  console.log('[seed] connected');

  await Promise.all([
    User.deleteMany({}),
    Availability.deleteMany({}),
    Appointment.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('[seed] cleared existing data');

  const hash = await bcrypt.hash(PASSWORD, 10);

  const [admin, anderson, chen, garcia, alice, bob, carol] = await User.create([
    { name: 'System Admin', email: 'admin@demo.edu', password: hash, role: 'admin' },
    { name: 'Prof. Emily Anderson', email: 'anderson@demo.edu', password: hash, role: 'faculty', department: 'Computer Science', title: 'Professor', officeLocation: 'Turing Hall 204', bio: 'Distributed systems and databases.' },
    { name: 'Dr. Wei Chen', email: 'chen@demo.edu', password: hash, role: 'faculty', department: 'Mathematics', title: 'Associate Professor', officeLocation: 'Euler Building 110', bio: 'Applied mathematics and optimization.' },
    { name: 'Prof. Maria Garcia', email: 'garcia@demo.edu', password: hash, role: 'faculty', department: 'Physics', title: 'Professor', officeLocation: 'Newton Labs 12', bio: 'Quantum mechanics and photonics.' },
    { name: 'Alice Johnson', email: 'alice@demo.edu', password: hash, role: 'student' },
    { name: 'Bob Smith', email: 'bob@demo.edu', password: hash, role: 'student' },
    { name: 'Carol Davis', email: 'carol@demo.edu', password: hash, role: 'student' },
  ]);
  console.log('[seed] created 7 users');

  await Availability.create([
    { facultyId: anderson._id, dayOfWeek: 'Monday', startTime: '09:00', endTime: '12:00', slotDuration: 30 },
    { facultyId: anderson._id, dayOfWeek: 'Wednesday', startTime: '14:00', endTime: '16:00', slotDuration: 30 },
    { facultyId: chen._id, dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '13:00', slotDuration: 45 },
    { facultyId: chen._id, dayOfWeek: 'Thursday', startTime: '13:00', endTime: '15:00', slotDuration: 30 },
    { facultyId: garcia._id, dayOfWeek: 'Friday', startTime: '11:00', endTime: '14:00', slotDuration: 30 },
  ]);
  console.log('[seed] created availability');

  await Appointment.create([
    { facultyId: anderson._id, studentId: alice._id, date: daysFromNow(2), startTime: '09:00', endTime: '09:30', status: 'confirmed', reason: 'Project proposal review' },
    { facultyId: anderson._id, studentId: bob._id, date: daysFromNow(2), startTime: '09:30', endTime: '10:00', status: 'pending', reason: 'Assignment questions' },
    { facultyId: chen._id, studentId: carol._id, date: daysFromNow(3), startTime: '10:00', endTime: '10:45', status: 'pending', reason: 'Exam prep' },
    { facultyId: garcia._id, studentId: alice._id, date: daysFromNow(-5), startTime: '11:00', endTime: '11:30', status: 'completed', reason: 'Lab discussion' },
  ]);
  console.log('[seed] created appointments');

  await Notification.create([
    { userId: anderson._id, type: 'appointment_created', message: 'New appointment request from Bob Smith' },
    { userId: alice._id, type: 'appointment_confirmed', message: 'Your appointment with Prof. Anderson was confirmed' },
  ]);

  console.log('\n[seed] Done! Log in with any of these (password: password123):');
  console.log('  admin@demo.edu   (admin)');
  console.log('  anderson@demo.edu, chen@demo.edu, garcia@demo.edu   (faculty)');
  console.log('  alice@demo.edu, bob@demo.edu, carol@demo.edu   (students)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
