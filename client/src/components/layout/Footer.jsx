import React from 'react';
import { Container } from 'react-bootstrap';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Container className="footer-shell">
        <div>
          <p className="footer-kicker">Battleground Intel</p>
          <p className="mb-0 footer-copy">&copy; 2026 Food Chain Rumble. All rights reserved.</p>
        </div>
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
