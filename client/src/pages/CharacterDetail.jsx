import { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { fetchCharacterById, clearSelectedCharacter } from '../store/slices/characterSlice';
import './CharacterDetail.css';
import CharacterIcon from "../components/character/CharacterIcon";

const CharacterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedCharacter: character, isLoading, error } = useSelector((state) => state.characters);

  useEffect(() => {
    dispatch(fetchCharacterById(id));
    return () => { dispatch(clearSelectedCharacter()); };
  }, [dispatch, id]);

  const getRoleColor = (role) => {
    const colors = { tank: '#3498db', fighter: '#e74c3c', assassin: '#9b59b6', utility: '#e67e22' };
    return colors[role] || '#95a5a6';
  };

  const getAbilityTypeColor = (type) => {
    const colors = { active: '#e74c3c', ultimate: '#9b59b6', passive: '#b1e255' };
    return colors[type] || '#95a5a6';
  };

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Alert variant="danger">{error}</Alert>
            <Button variant="primary" onClick={() => navigate('/characters')}>Back to Characters</Button>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!character) return null;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>

          <Button variant="outline-primary" className="mb-4 btn-back-top" onClick={() => navigate('/characters')}>
            ← Back to Characters
          </Button>

          {/* Character Header */}
          <div className="character-header mb-4">
            <Row className="align-items-center g-3">
              <Col xs="auto">
                <div className="character-image-large">
                  <CharacterIcon character={character} />
                </div>
              </Col>
              <Col>
                <h1 className="character-title">{character.name}</h1>
                <Badge className="role-badge-large mb-3" style={{ backgroundColor: getRoleColor(character.role) }}>
                  {character.role}
                </Badge>
                <p className="character-tagline mb-0">{character.description}</p>
              </Col>
            </Row>
          </div>

          {/* Abilities */}
          <div className="abilities-section mb-4">
            <h2>Abilities</h2>
            <Row className="g-3">
              {character.abilities.map((ability, index) => (
                <Col key={index} xs={12}>
                  <div className="ability-card">
                    <div className="ability-header">
                      <h3 className="ability-name">{ability.name}</h3>
                      <span className="ability-type-badge" style={{ backgroundColor: getAbilityTypeColor(ability.abilityType) }}>
                        {ability.abilityType}
                      </span>
                    </div>
                    <p className="ability-description">{ability.description}</p>
                    {(ability.cooldown > 0 || ability.damage > 0) && (
                      <div className="ability-stats">
                        {ability.cooldown > 0 && (
                          <div className="ability-stat">
                            <span className="ability-stat-label">Cooldown:</span>
                            <span className="ability-stat-value">{ability.cooldown}s</span>
                          </div>
                        )}
                        {ability.damage > 0 && (
                          <div className="ability-stat">
                            <span className="ability-stat-label">Damage:</span>
                            <span className="ability-stat-value">{ability.damage}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* Lore */}
          <div className="lore-section">
            <h2>Lore</h2>
            <p className="lore-text">{character.lore}</p>
          </div>

        </Col>
      </Row>
    </Container>
  );
};

export default CharacterDetail;