import React, { createContext, useState, useEffect } from 'react';
import api, { getErrorMessage } from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from localStorage on first load.
  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) {
      try {
        setUser({ token, ...JSON.parse(stored) });
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const persist = (token, profile) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(profile));
    setUser({ token, ...profile });
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email: email.trim(), password });
      persist(data.token, data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Login failed') };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      await api.post('/auth/register', { name, email: email.trim(), password, role });
      return { success: true };
    } catch (error) {
      return { success: false, message: getErrorMessage(error, 'Registration failed') };
    }
  };

  // Merge updated profile fields (e.g. after editing settings) into context.
  const updateUser = (patch) => {
    setUser((current) => {
      const next = { ...current, ...patch };
      const { token, ...profile } = next;
      localStorage.setItem('user', JSON.stringify(profile));
      return next;
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
