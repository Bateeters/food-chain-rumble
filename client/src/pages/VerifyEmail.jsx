import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import authService from '../services/authService';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const data = await authService.verifyEmail(token);
        setMessage(data.message);
        setStatus('success');
      } catch (error) {
        setMessage(error.response?.data?.error || 'Verification failed. Please try again.');
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <Container className="verify-page py-5 d-flex align-items-center justify-content-center">
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={8} md={6} lg={4}>
          <div className="verify-email-card">
            {status === 'verifying' && (
              <>
                <div className="verify-icon">⏳</div>
                <h2>Verifying your email...</h2>
                <p className="subtitle">Please wait a moment.</p>
              </>
            )}
            {status === 'success' && (
              <>
                <div className="verify-icon">✅</div>
                <h2>Email Verified!</h2>
                <p className="subtitle">{message}</p>
                <Button as={Link} to="/login" variant="primary" className="px-4 py-2">Go to Login</Button>
              </>
            )}
            {status === 'error' && (
              <>
                <div className="verify-icon">❌</div>
                <h2>Verification Failed</h2>
                <p className="subtitle">{message}</p>
                <Button as={Link} to="/register" variant="danger" className="px-4 py-2">Back to Register</Button>
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default VerifyEmail;