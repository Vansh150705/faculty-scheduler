import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import FacultyScheduler from './FacultyScheduler';
import StudentBooking from './StudentBooking';
import { LayoutDashboard } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container animate-slide-up">
      <div className="mb-10 p-8 glass-panel rounded-2xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-text-main m-0">
              Welcome back, {user.name.split(' ')[0]} <span className="inline-block animate-bounce" style={{ animationDuration: '2s' }}>👋</span>
            </h1>
          </div>
          <p className="text-text-muted text-lg">
            {user.role === 'faculty' && "Manage your schedule and upcoming appointments with ease."}
            {user.role === 'student' && "Find and book appointments with your faculty members."}
            {user.role === 'admin' && "System administration and global overview."}
          </p>
        </div>
        <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-light text-primary">
          <LayoutDashboard size={32} />
        </div>
      </div>

      <div className="animate-slide-up delay-200">
        {user.role === 'faculty' && <FacultyScheduler />}
        {user.role === 'student' && <StudentBooking />}
        {user.role === 'admin' && (
          <div className="glass-card p-12 text-center mt-8 border-dashed border-2">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <LayoutDashboard className="text-gray-400" size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-text-muted">Advanced administrative features are currently in development.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
