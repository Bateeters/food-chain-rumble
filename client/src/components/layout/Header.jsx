import { useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { logout } from '../../store/slices/authSlice';
import UserAvatar from '../user/UserAvatar';
import './Header.css';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [expanded, setExpanded] = useState(false);

  const close = () => setExpanded(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    close();
  };

  return (
    <Navbar expand="md" sticky="top" className="site-header" expanded={expanded} onToggle={setExpanded}>
      <Container className="header-shell">
        <Navbar.Brand as={Link} to="/" onClick={close} className="brand-lockup">
          <span className="brand-kicker">Alpha Build</span>
          <span className="brand-title">Food Chain Rumble</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" className="mobile-nav-btn" />
        <Navbar.Collapse id="main-nav" className="mobile-fullscreen">
          <Button bsPrefix="mobile-close-btn" onClick={close} aria-label="Close menu">x</Button>

          <Nav className="me-auto mobile-nav-links">
            <Nav.Link as={NavLink} to="/" onClick={close}>Home</Nav.Link>
            <Nav.Link as={NavLink} to="/characters" onClick={close}>Characters</Nav.Link>
            <Nav.Link as={NavLink} to="/leaderboard" onClick={close}>Leaderboard</Nav.Link>
            <Nav.Link as={NavLink} to="/forum" onClick={close}>Forum</Nav.Link>
          </Nav>

          <Nav className="flex-row mobile-auth-btns">
            {isAuthenticated ? (
              <>
                <Nav.Link as={NavLink} to="/dashboard" onClick={close} className="dashboard-link">
                  <UserAvatar user={user} size="small" showUsername={true} />
                </Nav.Link>
                <Button variant="outline-danger" size="sm" className="ms-2 my-auto logout-btn" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="secondary" size="sm" className="ms-2 my-auto py-1 px-lg-3 px-2" onClick={close}>
                  Login
                </Button>
                <Button as={Link} to="/register" variant="primary" size="sm" className="ms-2 my-auto py-1 px-lg-3 px-2" onClick={close}>
                  Play Now
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
