import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
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
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="bg-primary text-white p-3 rounded-2xl shadow-lg mb-4">
            <Calendar size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text-main text-center">Welcome Back</h1>
          <p className="text-text-muted mt-2 text-center">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-danger p-3 rounded-md text-sm mb-6 border border-red-100 text-center relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
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

          <button type="submit" className="btn btn-primary w-full mt-2 py-3 text-base">
            Sign In
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-text-muted relative z-10">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
