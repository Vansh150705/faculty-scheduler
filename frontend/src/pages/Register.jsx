import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Tag, CalendarDays, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await register(name, email, password, role);
      if (res.success) {
        navigate('/login');
      } else {
        setError(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split flex-row-reverse">
      <div className="auth-form-side">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary text-white mb-6 shadow-sm">
              <CalendarDays size={32} />
            </div>
            <h1 className="text-4xl font-extrabold text-text-main tracking-tight">Create Account</h1>
            <p className="text-text-muted mt-3 text-lg">Join the academic scheduling platform today.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-danger p-4 rounded-lg text-sm mb-6 border border-red-100 text-center font-medium animate-slide-up flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-danger"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="animate-slide-up delay-100">
              <label className="label">Full Name</label>
              <div className="input-group mb-0">
                <input
                  type="text"
                  required
                  className="input-field has-icon"
                  placeholder="Prof. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <UserIcon size={20} className="input-icon" />
              </div>
            </div>

            <div className="animate-slide-up delay-200">
              <label className="label">Email Address</label>
              <div className="input-group mb-0">
                <input
                  type="email"
                  required
                  className="input-field has-icon"
                  placeholder="jane.smith@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail size={20} className="input-icon" />
              </div>
            </div>
            
            <div className="animate-slide-up delay-300">
              <label className="label">Password</label>
              <div className="input-group mb-0">
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

            <div className="animate-slide-up delay-400">
              <label className="label">Role</label>
              <div className="input-group mb-0 relative">
                <select 
                  className="input-field has-icon appearance-none bg-white cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
                <Tag size={20} className="input-icon" />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn btn-primary w-full py-4 mt-4 text-lg shadow-md hover:shadow-lg animate-slide-up delay-400"
              style={{ backgroundColor: 'var(--secondary)' }}
            >
              {isLoading ? 'Creating Account...' : 'Register'}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="text-center mt-8 text-text-muted animate-slide-up delay-400">
            Already have an account?{' '}
            <Link to="/login" className="text-secondary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      
      <div className="auth-visual-side" style={{ background: 'var(--secondary)' }}>
        <div className="shape-1" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.02))' }}></div>
        <div className="shape-2" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.3), transparent)' }}></div>
        <div className="auth-visual-content animate-slide-up delay-200">
          <h2 className="text-white text-5xl font-extrabold mb-6 leading-tight">
            Connect. Schedule. Succeed.
          </h2>
          <p className="text-white text-xl opacity-90 leading-relaxed">
            Join thousands of faculty and students streamlining their academic lives with our intelligent scheduling tools.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
