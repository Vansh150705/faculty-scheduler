import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const { user } = useContext(AuthContext);
  useDocumentTitle('Page not found');
  const home = user ? '/dashboard' : '/login';

  return (
    <div className="container flex flex-col items-center justify-center text-center min-h-[70vh] animate-slide-up">
      <div className="w-20 h-20 rounded-3xl bg-primary-light text-primary flex items-center justify-center mb-6">
        <Compass size={40} />
      </div>
      <p className="text-6xl font-extrabold m-0 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </p>
      <h1 className="text-2xl font-bold text-text-main mt-2 mb-2">Page not found</h1>
      <p className="text-text-muted max-w-sm mb-8">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to={home} className="btn btn-primary">
        <ArrowLeft size={18} /> Back to {user ? 'dashboard' : 'sign in'}
      </Link>
    </div>
  );
};

export default NotFound;
