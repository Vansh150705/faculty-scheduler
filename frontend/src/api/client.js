import axios from 'axios';

// Single axios instance used across the app. The base URL comes from an env
// variable so the same build can point at different backends, and the auth
// token is attached automatically instead of being wired into every call.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

// Attach the bearer token (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On an expired/invalid session, clear local state and bounce to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.clear();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Normalises an axios error into a human-readable message.
export const getErrorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message ||
  error?.response?.data?.msg ||
  (Array.isArray(error?.response?.data?.details) ? error.response.data.details.join(', ') : null) ||
  error?.message ||
  fallback;

export default api;
