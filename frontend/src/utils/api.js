import axios from 'axios';

const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

let API_URL = process.env.REACT_APP_API_URL;

if (API_URL) {
  // Use .env value if provided (works in both dev and production)
} else if (isProduction) {
  API_URL = 'https://intervue-poll-0bvl.onrender.com/api';
} else {
  API_URL = 'http://localhost:5001/api';
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    if (config.url && (config.url.includes('/polls/active') || config.url.endsWith('/active'))) {
      config._suppress404Error = true;
      config._isExpected404 = true;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isExpected404 = error.config?._suppress404Error || 
                         error.config?._isExpected404 ||
                         (error.config?.url && error.config.url.includes('/polls/active'));
    
    if (error.response?.status === 404 && isExpected404) {
      const responseData = error.response?.data;
      const silentResponse = {
        data: responseData?.poll === null ? { poll: null, remainingTime: 0 } : null,
        status: 404,
        statusText: 'Not Found',
        headers: error.response?.headers || {},
        config: { ...error.config, _silent: true },
        isNoActivePoll: true
      };
      return Promise.resolve(silentResponse);
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.status, error.config?.url);
    } else if (error.response?.status >= 400 && error.response?.status < 500 && !isExpected404) {
      console.warn('Client error:', error.response?.status, error.config?.url);
    } else if (!error.response) {
      console.error('Network error:', error.message, error.config?.url);
    }
    
    return Promise.reject(error);
  }
);

export default api;

