import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import AuthService from '../services/authService';

// Check if user is already authenticated
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      const user = await AuthService.getCurrentUser();
      return user;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

// Register new user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await AuthService.register(userData);
      toast.success('Registration successful! Please log in.');
      return response;
    } catch (error) {
      const message = extractErrorMessage(error);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await AuthService.login(credentials);
      localStorage.setItem('token', response.token);
      toast.success('Login successful!');
      return response.user;
    } catch (error) {
      const message = extractErrorMessage(error);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    return null;
  }
);

// Helper function to extract error messages from different error types
const extractErrorMessage = (error) => {
  if (error.response) {
    // The server responded with a status code outside the 2xx range
    const { data } = error.response;
    
    // Check for structured error message
    if (data.message) return data.message;
    if (data.error) return data.error;
    
    // Check for validation errors (ASP.NET Core validation)
    if (data.errors) {
      const firstError = Object.values(data.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : 'Validation failed';
    }
    
    // For string error responses
    if (typeof data === 'string') return data;
    
    // Default error messages based on status code
    switch (error.response.status) {
      case 400: return 'Invalid request data';
      case 401: return 'Authentication required';
      case 403: return 'You do not have permission to perform this action';
      case 404: return 'Resource not found';
      case 500: return 'Server error occurred';
      default: return `Error: ${error.response.status}`;
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your internet connection.';
  } else {
    // Something else caused the error
    return error.message || 'Unknown error occurred';
  }
};

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  initialized: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
        state.initialized = true;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { resetAuthError } = authSlice.actions;
export default authSlice.reducer;
