import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, CalendarDays, ArrowRight } from 'lucide-react';

const Login = () => {
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
            <h1 className="text-4xl font-extrabold text-text-main tracking-tight">Welcome Back</h1>
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
        <div className="auth-visual-content animate-slide-up delay-200">
          <h2 className="text-white text-5xl font-extrabold mb-6 leading-tight">
            Seamlessly coordinate your academic schedule.
          </h2>
          <p className="text-primary-light text-xl opacity-90 leading-relaxed">
            The premium scheduling platform designed exclusively for university faculty and students. Manage office hours, book appointments, and stay organized.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
