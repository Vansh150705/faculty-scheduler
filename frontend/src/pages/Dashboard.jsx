import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import FacultyScheduler from './FacultyScheduler';
import StudentBooking from './StudentBooking';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main">
          Hello, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-text-muted mt-2">
          {user.role === 'faculty' && "Manage your schedule and upcoming appointments."}
          {user.role === 'student' && "Book an appointment with your faculty members."}
          {user.role === 'admin' && "System administration dashboard."}
        </p>
      </div>

      {user.role === 'faculty' && <FacultyScheduler />}
      {user.role === 'student' && <StudentBooking />}
      {user.role === 'admin' && (
        <div className="glass-card p-8 text-center mt-8">
          <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
          <p className="text-text-muted">Admin features coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
