import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { register, resetAuthError } from '../store/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validated, setValidated] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [passwordMatch, setPasswordMatch] = useState(true);
  
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
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
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
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      setPasswordMatch(false);
    } else {
      setPasswordMatch(true);
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
    
    // Check password match when either password field changes
    if (name === 'password' || name === 'confirmPassword') {
      const passwordVal = name === 'password' ? value : formData.password;
      const confirmVal = name === 'confirmPassword' ? value : formData.confirmPassword;
      
      if (confirmVal) {
        setPasswordMatch(passwordVal === confirmVal);
      }
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
    
    // All validation passed, dispatch register action
    const { name, email, password } = formData;
    dispatch(register({ name, email, password }));
  };

  return (
    <div className="auth-container">
      <h2 className="text-center mb-4">Register</h2>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => dispatch(resetAuthError())}>
          {error}
        </Alert>
      )}
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="name">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            isInvalid={validated && !!formErrors.name}
            required
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.name || 'Please provide your name.'}
          </Form.Control.Feedback>
        </Form.Group>

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

        <Form.Group className="mb-3" controlId="confirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            isInvalid={validated && (!!formErrors.confirmPassword || !passwordMatch)}
            required
          />
          <Form.Control.Feedback type="invalid">
            {formErrors.confirmPassword || 'Passwords do not match.'}
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
              Registering...
            </>
          ) : 'Register'}
        </Button>
        
        <div className="text-center">
          <span>Already have an account? </span>
          <Link to="/login">Login here</Link>
        </div>
      </Form>
    </div>
  );
};

export default Register;
