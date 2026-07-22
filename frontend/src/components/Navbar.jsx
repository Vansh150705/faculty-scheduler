import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Calendar, User as UserIcon, Sun, Moon, LayoutDashboard, Settings, Shield } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
    { to: '/profile', label: 'Profile', icon: Settings },
  ];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-6'}`}>
      <nav className={`container mx-auto max-w-6xl flex justify-between items-center transition-all duration-300 ${scrolled ? 'glass-nav rounded-full px-6 py-3 shadow-lg' : 'px-6 py-2 bg-transparent'}`}>
        <Link to="/dashboard" className="flex items-center gap-3 no-underline">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white shadow-md">
            <Calendar size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-text-main" style={{ fontFamily: "'Outfit', sans-serif" }}>
            FacultyScheduler
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all no-underline ${
                  active ? 'bg-primary-light text-primary' : 'text-text-muted hover:text-primary hover:bg-primary-light/50'
                }`}
              >
                <Icon size={16} /> {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <button
            onClick={toggleTheme}
            className="btn-icon text-text-muted hover:text-primary"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="hidden lg:flex items-center gap-3 bg-surface border border-border px-4 py-2 rounded-full shadow-sm">
            <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center">
              <UserIcon size={14} />
            </div>
            <span className="font-medium text-sm text-text-main">{user.name}</span>
            <div className="w-px h-4 bg-border mx-1"></div>
            <span className="text-xs text-primary uppercase tracking-wider font-bold">{user.role}</span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-secondary text-text-muted hover:text-danger hover:border-danger !p-2 !rounded-full group"
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
