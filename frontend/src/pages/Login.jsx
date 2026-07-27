import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Mail, Lock, CalendarDays, ArrowRight } from 'lucide-react';

const Login = () => {
  useDocumentTitle('Sign in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-form-side">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-light text-primary mb-6 shadow-sm">
              <CalendarDays size={32} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight m-0 bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-secondary" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Welcome Back</h1>
            <p className="text-text-muted mt-3 text-lg">Enter your details to access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-danger p-4 rounded-lg text-sm mb-6 border border-red-100 text-center font-medium animate-slide-up delay-100 flex items-center justify-center gap-2">
               <span className="w-2 h-2 rounded-full bg-danger"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="animate-slide-up delay-100">
              <label className="label">Email Address</label>
              <div className="input-group">
                <input
                  type="email"
                  required
                  className="input-field has-icon"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={20} className="input-icon" />
              </div>
            </div>
            
            <div className="animate-slide-up delay-200">
              <label className="label">Password</label>
              <div className="input-group">
                <input
                  type="password"
                  required
                  className="input-field has-icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock size={20} className="input-icon" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn btn-primary w-full py-4 mt-2 text-lg shadow-md hover:shadow-lg animate-slide-up delay-300"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="text-center mt-10 text-text-muted animate-slide-up delay-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
      
      <div className="auth-visual-side">
        <div className="shape-1"></div>
        <div className="shape-2"></div>
        <div className="auth-visual-content animate-slide-up delay-200 relative">
          <h2 className="text-white text-5xl font-extrabold mb-6 leading-tight">
            Seamlessly coordinate your academic schedule.
          </h2>
          <p className="text-primary-light text-xl opacity-90 leading-relaxed mb-12">
            The premium scheduling platform designed exclusively for university faculty and students. Manage office hours, book appointments, and stay organized with this scheduling platform.
          </p>

          {/* Floating Element 1 - Faculty */}
          <div className="absolute -right-12 top-0 glass-panel p-4 flex items-center gap-4 animate-bounce hidden lg:flex" style={{ animationDuration: '4s', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-md">👨‍🏫</div>
            <div>
              <p className="font-bold text-white text-sm">Prof. Anderson</p>
              <p className="text-primary-light text-xs">Available at 2:00 PM</p>
            </div>
          </div>

          {/* Floating Element 2 - Student */}
          <div className="absolute -left-8 bottom-0 glass-panel p-4 flex items-center gap-4 animate-bounce hidden lg:flex" style={{ animationDuration: '5s', animationDelay: '1s', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-md">👩‍🎓</div>
            <div>
              <p className="font-bold text-white text-sm">Sarah Jenkins</p>
              <p className="text-primary-light text-xs">Booked Session</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
