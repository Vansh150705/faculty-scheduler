import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Calendar, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 mb-8 mx-4 mt-4 px-6 py-4 flex justify-between items-center animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="bg-primary text-white p-2 rounded-lg">
          <Calendar size={24} />
        </div>
        <span className="font-bold text-xl text-primary">FacultyScheduler</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-text-muted">
          <UserIcon size={18} />
          <span className="font-medium text-text-main">{user.name}</span>
          <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full uppercase tracking-wide font-semibold">
            {user.role}
          </span>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary text-danger hover:bg-danger hover:text-white hover:border-danger transition">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
