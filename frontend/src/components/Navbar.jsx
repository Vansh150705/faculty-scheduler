import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Calendar, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
      <nav className={`container mx-auto max-w-6xl flex justify-between items-center transition-all duration-300 ${scrolled ? 'glass-nav rounded-full px-6 py-3 shadow-lg' : 'px-6 py-2 bg-transparent'}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white shadow-md">
            <Calendar size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
            FacultyScheduler
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 bg-surface border border-border px-4 py-2 rounded-full shadow-sm">
            <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center">
              <UserIcon size={14} />
            </div>
            <span className="font-medium text-sm text-text-main">{user.name}</span>
            <div className="w-px h-4 bg-border mx-1"></div>
            <span className="text-xs text-primary uppercase tracking-wider font-bold">
              {user.role}
            </span>
          </div>
          
          <button 
            onClick={handleLogout} 
            className="btn btn-secondary text-text-muted hover:text-danger hover:border-danger hover:bg-red-50 !p-2 !rounded-full group"
            title="Logout"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
