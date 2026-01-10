import axios from 'axios';

// Auto-detect production environment
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

// Get API URL from environment variable or auto-detect
let API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
  if (isProduction) {
    // Auto-detect Render backend URL (common pattern)
    // You can override this with REACT_APP_API_URL env variable
    API_URL = 'https://intervue-poll-0bvl.onrender.com/api';
    console.warn('⚠️ REACT_APP_API_URL not set. Using default Render URL:', API_URL);
    console.warn('   Set REACT_APP_API_URL in Vercel environment variables for production!');
  } else {
    API_URL = 'http://localhost:5001/api';
  }
}

// Log the URL being used (helpful for debugging)
console.log('🌐 API URL:', API_URL);
console.log('📍 Environment:', isProduction ? 'Production' : 'Development');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to mark expected 404s
api.interceptors.request.use(
  (config) => {
    // Mark requests to /polls/active so we can handle 404s silently
    if (config.url && (config.url.includes('/polls/active') || config.url.endsWith('/active'))) {
      config._suppress404Error = true;
      config._isExpected404 = true;
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
    const isExpected404 = error.config?._suppress404Error || 
                         error.config?._isExpected404 ||
                         (error.config?.url && error.config.url.includes('/polls/active'));
    
    if (error.response?.status === 404 && isExpected404) {
      // This is expected - no active poll exists
      // Return a resolved promise with null data to prevent error logging
      // Override the error to prevent browser console from showing it
      const silentResponse = {
        data: null,
        status: 404,
        statusText: 'Not Found',
        headers: error.response?.headers || {},
        config: { ...error.config, _silent: true },
        isNoActivePoll: true
      };
      
      // Suppress console error by returning resolved promise
      return Promise.resolve(silentResponse);
    }
    
    // Log other errors for debugging (but not expected 404s)
    if (error.response?.status >= 500) {
      console.error('❌ Server error:', error.response?.status, error.config?.url);
    } else if (error.response?.status >= 400 && error.response?.status < 500 && !isExpected404) {
      console.warn('⚠️ Client error:', error.response?.status, error.config?.url);
    } else if (!error.response) {
      console.error('❌ Network error:', error.message, error.config?.url);
    }
    
    return Promise.reject(error);
  }
);

export default api;

