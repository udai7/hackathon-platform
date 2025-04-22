import axios from 'axios';

// API URL from environment variable or default to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent long-running requests
  timeout: 15000, // 15 seconds
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network errors (no response from server)
    if (!error.response) {
      console.error('Network Error:', error.message);
      
      // Customized error message based on the type of network error
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout. Server took too long to respond.');
        return Promise.reject(new Error('Request timeout. The server is taking too long to respond. Please try again later.'));
      }
      
      if (error.message.includes('Network Error')) {
        console.error('Cannot connect to the server. Please check your internet connection and try again.');
        return Promise.reject(new Error('Cannot connect to the server. Please check your internet connection or verify that the server is running.'));
      }
      
      return Promise.reject(new Error('Network error. Please check your connection and try again.'));
    }
    
    // Handle common errors like authentication issues
    if (error.response.status === 401) {
      // Handle unauthorized (e.g., token expired)
      localStorage.removeItem('authToken');
      // Could also redirect to login page
      return Promise.reject(new Error('Your session has expired. Please log in again.'));
    } else if (error.response.status === 403) {
      // Handle forbidden
      console.error('You do not have permission to perform this action');
      return Promise.reject(new Error('You do not have permission to perform this action.'));
    } else if (error.response.status === 500) {
      // Handle server errors
      console.error('Server error occurred. Please try again later.');
      return Promise.reject(new Error('A server error occurred. Please try again later.'));
    } else if (error.response.status === 404) {
      // Handle not found
      console.error('Resource not found.');
      return Promise.reject(new Error('The requested resource was not found.'));
    }
    
    // For other errors, pass through the error or error message from the server
    if (error.response.data && error.response.data.message) {
      return Promise.reject(new Error(error.response.data.message));
    }
    
    return Promise.reject(error);
  }
);

export default api; 