import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import FacultyScheduler from './FacultyScheduler';
import StudentBooking from './StudentBooking';
import StatsGrid from '../components/StatsGrid';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { LayoutDashboard, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  useDocumentTitle('Dashboard');

  return (
    <div className="container animate-slide-up">
      <div className="mb-10 p-8 glass-panel rounded-2xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-extrabold m-0 bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-secondary" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Welcome back, {user.name.split(' ')[0]} <span className="inline-block animate-bounce" style={{ animationDuration: '2s', WebkitTextFillColor: 'initial' }}>👋</span>
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

      {(user.role === 'faculty' || user.role === 'student') && <StatsGrid />}

      <div className="animate-slide-up delay-200">
        {user.role === 'faculty' && <FacultyScheduler />}
        {user.role === 'student' && <StudentBooking />}
        {user.role === 'admin' && (
          <div className="glass-card p-12 text-center mt-4 border-dashed border-2 border-border">
            <div className="w-16 h-16 mx-auto bg-primary-light text-primary rounded-full flex items-center justify-center mb-4">
              <LayoutDashboard size={24} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-text-main">Administration</h2>
            <p className="text-text-muted mb-6">Manage users and view system-wide analytics.</p>
            <Link to="/admin" className="btn btn-primary inline-flex">
              Open Admin Panel <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
