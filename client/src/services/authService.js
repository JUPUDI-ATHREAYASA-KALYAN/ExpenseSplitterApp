import apiClient from './apiService';
import jwt_decode from 'jwt-decode';

class AuthService {
  // Register a new user
  async register(userData) {
    console.log('Registering user with data:', userData);
    try {
      const response = await apiClient.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      console.error('Full error object:', error);
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    console.log('Logging in user with credentials:', credentials);
    try {
      const response = await apiClient.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      console.error('Full error object:', error);
      throw error;
    }
  }

  // Get current user from token
  async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token has expired
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        return null;
      }
      
      // Get user details from API
      const response = await apiClient.get(`/users/${decoded.nameid}`);
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return null;
    }
  }
}

const authService = new AuthService();
export default authService;
