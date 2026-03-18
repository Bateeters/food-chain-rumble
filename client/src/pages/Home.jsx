import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <>
      {/* Hero */}
      <section className="py-5 text-center bg-dark text-white">
        <Container className="py-5 home-hero">
            <Row className='h-100'>
                <div className='my-auto'>
                    <h1 className="display-3 fw-bold mb-3">Food Chain Rumble</h1>
                    <p className="lead mb-4">
                        Battle your way to the top of the food chain in this competitive platform brawler!
                    </p>
                    {isAuthenticated ? (
                        <Button as={Link} to="/dashboard" variant="primary" size="lg">
                        Go to Dashboard
                        </Button>
                    ) : (
                        <div className="d-flex gap-3 justify-content-center flex-wrap">
                        <Button as={Link} to="/register" variant="primary" size="lg">
                            Get Started
                        </Button>
                        <Button as={Link} to="/login" variant="outline-light" size="lg">
                            Login
                        </Button>
                        </div>
                    )}
                    <p className="mt-4 text-secondary">Watch for us on all major platforms</p>
                </div>
            </Row>
        </Container>
      </section>

      {/* Features */}
      <section className="py-5 bg-secondary bg-opacity-10">
        <Container>
            <Row className="g-4 justify-content-center p-5">
                <Col md={12} className='home-card'>
                    <div className="d-flex flex-column justify-content-center p-5 rounded h-100 bg-dark text-white">
                        <h3 className="mb-3">Unique Characters</h3>
                        <p className="text-secondary mb-0">
                        Choose from a diverse roster of animals, each with unique abilities and playstyles.
                        </p>
                    </div>
                </Col>
            </Row>
            <Row className="g-4 justify-content-center p-5">
                <Col md={12} className='home-card'>
                    <div className="d-flex flex-column justify-content-center p-5 rounded h-100 bg-dark text-white">
                        <h3 className="mb-3">Competitive Ranked</h3>
                        <p className="text-secondary mb-0">
                        Become the alpha predator in 1v1 or increase your chances of survival in the wild and team up for 2v2 or 3v3.
                        </p>
                    </div>
                </Col>
            </Row>
            <Row className="g-4 justify-content-center p-5">
                <Col md={12} className='home-card'>
                    <div className="d-flex flex-column justify-content-center p-5 rounded h-100 bg-dark text-white">
                        <h3 className="mb-3">Fair-Play Matchmaking</h3>
                        <p className="text-secondary mb-0">
                        Advanced matchmaking ensures fair and balanced ranked matches.
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
      </section>
    </>
  );
};

export default Home;