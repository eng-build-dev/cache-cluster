import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to suppress console errors for expected 404s
api.interceptors.request.use(
  (config) => {
    // Mark requests to /polls/active so we can handle 404s silently
    if (config.url && config.url.includes('/polls/active')) {
      config._suppress404Error = true;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 404 gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently handle 404 for /polls/active (no active poll is normal)
    if (error.response?.status === 404 && 
        (error.config?.url?.includes('/polls/active') || error.config?._suppress404Error)) {
      // Suppress the error from showing in console
      // Override the error to prevent browser from logging it
      const silentError = Object.create(error);
      silentError.isNoActivePoll = true;
      silentError.response = {
        ...error.response,
        status: 404,
        data: { error: 'No active poll found' }
      };
      silentError.config = error.config;
      // Prevent default error logging
      silentError.toJSON = () => ({ isNoActivePoll: true });
      return Promise.reject(silentError);
    }
    return Promise.reject(error);
  }
);

export default api;

