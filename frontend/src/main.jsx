import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App.jsx';

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Add axios interceptor for auth token
axios.interceptors.request.use(
  (config) => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      try {
        const parsedAuth = JSON.parse(auth);
        if (parsedAuth.token) {
          config.headers.Authorization = `Bearer ${parsedAuth.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
        // Clear invalid auth data
        localStorage.removeItem('auth');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth and redirect to login
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
