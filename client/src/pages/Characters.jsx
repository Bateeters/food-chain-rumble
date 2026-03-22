import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCharacters } from '../store/slices/characterSlice';
import CharacterCard from '../components/character/CharacterCard';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import './Characters.css';

const Characters = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { characters, isLoading, error } = useSelector((state) => state.characters);

  useEffect(() => {
    dispatch(fetchCharacters());
  }, [dispatch]);

  const handleCharacterClick = (id) => {
    navigate(`/characters/${id}`);
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !Array.isArray(characters)) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Invalid data format'}</Alert>
      </Container>
    );
  }

  return (
    <div className="characters-page">
      <section className="characters-hero">
        <Container>
          <Row className="align-items-center g-4">
            <Col lg={7}>
              <p className="characters-kicker">Roster</p>
              <h1 className="characters-title">Choose your fighter.</h1>
              <p className="characters-copy">
                A lineup of predators, bruisers, tricksters, and support specialists built for aggressive reads
                and matchup variety. Pick one and drill into abilities, role, and lore.
              </p>
              <div className="characters-hero-actions">
                <Button variant="primary" onClick={() => navigate('/')}>Back Home</Button>
              </div>
            </Col>
            <Col lg={5}>
              <div className="characters-hero-panel">
                <span>Roster Art Placeholder</span>
                <small>Ideal for a collage, lineup render, or class showcase image</small>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="characters-grid-section">
        <Container>
          {characters.length === 0 ? (
            <p className="text-center text-secondary">No characters found</p>
          ) : (
            <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
              {characters.map((character) => (
                <Col key={character._id}>
                  <CharacterCard
                    character={character}
                    onClick={() => handleCharacterClick(character._id)}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>
    </div>
  );
};

export default Characters;
