import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCharacters } from '../store/slices/characterSlice';
import CharacterCard from '../components/character/CharacterCard';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

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
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">Choose Your Fighter</h1>
        <p className="text-secondary">Select a character to deep dive into the roster.</p>
      </div>

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
  );
};

export default Characters;
