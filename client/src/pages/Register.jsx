import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { register, clearError } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import './Register.css';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', confirmPassword: '', dateOfBirth: ''
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error, { autoClose: 6000 });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.dateOfBirth) {
      toast.error('Please fill in all fields'); return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long'); return;
    }
    const { confirmPassword, ...registerData } = formData;
    const result = await dispatch(register(registerData));
    if (register.fulfilled.match(result)) {
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    }
  };

  return (
    <Container className="register-page py-5 d-flex align-items-center justify-content-center">
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={10} md={7} lg={5}>
          <div className="register-card">
            <h2>Join the Arena!</h2>
            <p className="subtitle">Create your account and start battling</p>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 8 characters)"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 mt-3" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </Form>

            <div className="register-footer">
              <p>Already have an account?{' '}<Link to="/login">Log in here</Link></p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;