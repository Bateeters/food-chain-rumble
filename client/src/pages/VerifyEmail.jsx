import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import authService from '../services/authService';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
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
    <div className="verify-email-page">
      <div className="verify-email-container">
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
              <Link to="/login" className="btn-verify">Go to Login</Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="verify-icon">❌</div>
              <h2>Verification Failed</h2>
              <p className="subtitle">{message}</p>
              <Link to="/register" className="btn-verify btn-verify--error">Back to Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;