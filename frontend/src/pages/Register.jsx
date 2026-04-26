import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Mail, Lock, User as UserIcon, Tag } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(name, email, password, role);
    if (res.success) {
      navigate('/login');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="hero-gradient flex justify-center items-center h-screen w-full absolute top-0 left-0">
      <div className="glass-panel w-full max-w-md p-8 m-4 animate-fade-in relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary rounded-full blur-3xl opacity-20"></div>
        
        <div className="flex flex-col items-center mb-6 relative z-10">
          <div className="bg-primary text-white p-3 rounded-2xl shadow-lg mb-4">
            <Calendar size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text-main text-center">Create Account</h1>
          <p className="text-text-muted mt-2 text-center">Join FacultyScheduler today</p>
        </div>

        {error && (
          <div className="bg-red-50 text-danger p-3 rounded-md text-sm mb-6 border border-red-100 text-center relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                required
                className="input-field pl-10"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="input-field pl-10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className="input-field pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Role</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <Tag size={18} />
              </div>
              <select 
                className="input-field pl-10 appearance-none bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2 py-3 text-base">
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-text-muted relative z-10">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
