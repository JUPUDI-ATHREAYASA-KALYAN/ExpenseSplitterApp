import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7156/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token in requests
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common error cases
apiClient.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    // Log all errors for debugging
    console.error('API Error:', error);
    
    if (response) {
      // Handle different status codes
      switch (response.status) {
        case 400:
          console.error('Bad Request:', response.data);
          break;
        case 401:
          console.error('Unauthorized:', response.data);
          // Optionally redirect to login
          // window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden:', response.data);
          break;
        case 404:
          console.error('Not Found:', response.data);
          break;
        case 500:
          console.error('Server Error:', response.data);
          toast.error('An unexpected server error occurred');
          break;
        default:
          console.error(`Error (${response.status}):`, response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error - No response received:', error.request);
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened in setting up the request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
