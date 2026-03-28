import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Button } from 'react-bootstrap';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="home-page">
      <section className="hero-cinematic">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster=""
        >
          <source src="/media/gameplay-hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-fallback" aria-hidden="true">
          <span>Gameplay Video Placeholder</span>
          <small>Add a looping video at `client/public/media/gameplay-hero.mp4`</small>
        </div>
        <div className="hero-overlay" />
        <Container className="hero-content">
          <div className="hero-logo-lockup">
            <span className="hero-logo-mark">FCR</span>
            <div>
              <p className="hero-logo-kicker">Coming Soon</p>
              <h1 className="hero-logo-title">Food Chain Rumble</h1>
            </div>
          </div>
          <p className="hero-tagline">Apex predators clash for ranked survival in this competitive platform brawler.</p>
          <p className="hero-summary">
            Master a wild roster, chase the ladder, and break down every battle through detailed match intel.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <>
                <Button as={Link} to="/dashboard" variant="primary" size="lg">Open Dashboard</Button>
                <Button as={Link} to="/characters" variant="outline-light" size="lg">View Roster</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/register" variant="primary" size="lg">Get Notified</Button>
                <Button as={Link} to="/characters" variant="outline-light" size="lg">Meet the Fighters</Button>
              </>
            )}
          </div>
        </Container>
      </section>

      <section className="home-feature-section">
        <Container>
          <Row className="g-4 align-items-center">
            <Col lg={9} className='m-auto mt-5 py-5'>
              <p className="section-kicker">The Hunt</p>
              <h2 className="section-title">Fast reads, hard counters, and ranked pressure.</h2>
              <p className="section-copy">
                Food Chain Rumble mixes expressive movement with competitive depth, letting players swap between
                solo duels and coordinated team hunts while tracking every matchup.
              </p>
            </Col>
            <Col lg={12}>
              <Row className="g-4">
                <Col lg={9} md={12} className='m-auto py-5'>
                  <div className="home-feature-card home-card-img shark-banner" 
                  style={{ '--home-card-banner': `url(${process.env.PUBLIC_URL}/images/shark-banner.png)` }}>
                    <span className="feature-label">01</span>
                    <h3>Distinct Roster</h3>
                    <p>
                      Every animal enters the arena with a clear silhouette, a unique movement rhythm, and a combat
                      identity that changes how neutral, pressure, and recovery play out.
                    </p>
                    <br />
                    <p>
                      From fast ambushers to heavy bruisers, the roster is built so matchups feel different and team
                      compositions create real predator-prey tension.
                    </p>
                  </div>
                </Col>
                <Col lg={9} md={12} className='m-auto py-5'>
                  <div
                    className="home-feature-card home-card-img porcupine-banner"
                    style={{ '--home-card-banner': `url(${process.env.PUBLIC_URL}/images/porcupine-banner.png)` }}>
                    <span className="feature-label">02</span>
                    <h3>Ranked Modes</h3>
                    <p>
                      Queue into 1v1, 2v2, and 3v3 ladders designed for players who want fast matchmaking, visible
                      progression, and meaningful stakes every time they hit ready.
                    </p>
                    <br/>
                    <p>
                      Seasonal climbs, match history, and clear rank tracking make it easy to measure improvement and
                      identify where your squad performs best under pressure.
                    </p>
                  </div>
                </Col>
                <Col lg={9} md={12} className='m-auto py-5'>
                  <div className="home-feature-card home-card-img chameleon-banner"
                    style={{ '--home-card-banner': `url(${process.env.PUBLIC_URL}/images/chameleon-banner.png)` }}>
                    <span className="feature-label">03</span>
                    <h3>Battle Intel</h3>
                    <p>Review recent matches, team output, and top performers with a cleaner post-game view.</p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
