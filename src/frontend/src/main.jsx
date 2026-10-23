import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// A static host with no API behind it answers /api requests with the app's
// HTML page. Treat that as a failed request instead of passing it on as data.
axios.interceptors.response.use((response) => {
  const type = response.headers?.['content-type'] || '';
  if (response.config?.url?.startsWith('/api') && type.includes('text/html')) {
    return Promise.reject(new Error('API unavailable'));
  }
  return response;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
