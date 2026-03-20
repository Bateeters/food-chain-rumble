import React from 'react';
import { Container } from 'react-bootstrap';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Container className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <p className="mb-0">&copy; 2026 Food Chain Rumble. All rights reserved.</p>
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;