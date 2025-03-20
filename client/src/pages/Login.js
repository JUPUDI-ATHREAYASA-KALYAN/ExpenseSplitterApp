import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { login, resetAuthError } from '../store/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validated, setValidated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);

  // Clear any auth errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetAuthError());
    };
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset auth error when submitting
    dispatch(resetAuthError());
    
    // Validate form
    if (!validateForm()) {
      setValidated(true);
      return;
    }
    
    dispatch(login(formData));
  };

  return (
    <div className="auth-container">
      <h2 className="text-center mb-4">Login</h2>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => dispatch(resetAuthError())}>
          {error}
        </Alert>
      )}
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={validated && !!formErrors.email}
            required
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.email || 'Please provide a valid email.'}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            isInvalid={validated && !!formErrors.password}
            required
            minLength="6"
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.password || 'Password must be at least 6 characters long.'}
          </Form.Control.Feedback>
        </Form.Group>

        <Button 
          variant="primary" 
          type="submit" 
          className="w-100 mb-3"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              Logging in...
            </>
          ) : 'Login'}
        </Button>
        
        <div className="text-center">
          <span>Don't have an account? </span>
          <Link to="/register">Register here</Link>
        </div>
      </Form>
    </div>
  );
};

export default Login;
