import axios from 'axios';

// Create axios instance with base URL from environment variables
console.log('API baseURL:', import.meta.env.VITE_API_BASE_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Debugging logs using axios interceptors
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor to add the JWT token to requests
api.interceptors.request.use(
  (config) => {
    // Update debug container instead of console logging
    const debugInfo = {
      method: config.method,
      url: config.url,
      data: config.data
    };
    
    // Update debug info in the sidebar if element exists
    const debugContainer = document.getElementById('debug-container');
    if (debugContainer) {
      debugContainer.innerHTML = `Request: ${JSON.stringify(debugInfo, null, 2)}`;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (debugContainer) {
        debugContainer.innerHTML += '<br>Token added to request headers';
      }
    } else {
      if (debugContainer) {
        debugContainer.innerHTML += '<br>No token found in localStorage';
      }
    }
    return config;
  },
  (error) => {
    const debugContainer = document.getElementById('debug-container');
    if (debugContainer) {
      debugContainer.innerHTML = `Request error: ${error.message}`;
    }
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Update debug container with response info
    const debugInfo = {
      status: response.status,
      data: response.data
    };
    
    const debugContainer = document.getElementById('debug-container');
    if (debugContainer) {
      debugContainer.innerHTML = `Response success: ${JSON.stringify(debugInfo, null, 2)}`;
    }
    return response;
  },
  (error) => {
    const errorInfo = {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    };
    
    const debugContainer = document.getElementById('debug-container');
    if (debugContainer) {
      debugContainer.innerHTML = `Response error: ${JSON.stringify(errorInfo, null, 2)}`;
    }
    
    // Handle unauthorized errors (token expired, etc.)
    if (error.response && error.response.status === 401) {
      if (debugContainer) {
        debugContainer.innerHTML += '<br>Unauthorized error, clearing tokens';
      }
      // Clear token and user info if it exists
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // If not on auth pages, redirect to login
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/signup')) {
        if (debugContainer) {
          debugContainer.innerHTML += '<br>Redirecting to login page';
        }
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;