import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { fetchCharacterById, clearSelectedCharacter } from '../store/slices/characterSlice';
import './CharacterDetail.css';
import CharacterIcon from '../components/character/CharacterIcon';

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
    const colors = {
      tank: 'var(--fcr-highlight)',
      fighter: 'var(--fcr-primary-600)',
      assassin: 'var(--fcr-accent)',
      utility: 'var(--fcr-accent-gold)'
    };
    return colors[role] || 'var(--fcr-accent-cream)';
  };

  const getAbilityTypeColor = (type) => {
    const colors = {
      active: 'var(--fcr-primary-600)',
      ultimate: 'var(--fcr-accent)',
      passive: 'var(--fcr-highlight)'
    };
    return colors[type] || 'var(--fcr-accent-cream)';
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
    <div className="character-detail-page">
      <section className="character-detail-hero">
        <Container>
          <Button variant="outline-primary" className="mb-4 btn-back-top" onClick={() => navigate('/characters')}>
            Back to Characters
          </Button>

          <div className="character-hero-panel">
            <Row className="align-items-center g-4">
              <Col lg={7}>
                <p className="character-detail-kicker">Character Profile</p>
                <h1 className="character-title">{character.name}</h1>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <Badge className="role-badge-large" style={{ backgroundColor: getRoleColor(character.role), color: '#1a0d08' }}>
                    {character.role}
                  </Badge>
                  <Badge bg="secondary" className="role-badge-large">
                    Difficulty {'*'.repeat(parseInt(character.difficulty, 10))}
                  </Badge>
                </div>
                <p className="character-tagline mb-0">{character.description}</p>
              </Col>
              <Col lg={5}>
                <div className="character-hero-visual">
                  <div className="character-image-large">
                    <CharacterIcon character={character} />
                  </div>
                  <div className="character-visual-caption">
                    <span>Feature Art Placeholder</span>
                    <small>Use this space for splash art or a full character render</small>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </section>

      <section className="character-detail-content">
        <Container>
          <Row className="g-4">
            <Col lg={8}>
              <div className="abilities-section h-100">
                <div className="section-heading">
                  <p>Kit Breakdown</p>
                  <h2>Abilities</h2>
                </div>
                <Row className="g-3">
                  {character.abilities.map((ability, index) => (
                    <Col key={index} xs={12}>
                      <div className="ability-card">
                        <div className="ability-index">{index + 1}</div>
                        <div className="ability-main">
                          <div className="ability-header">
                            <h3 className="ability-name">{ability.name}</h3>
                            <span className="ability-type-badge" style={{ backgroundColor: getAbilityTypeColor(ability.abilityType), color: '#1a0d08' }}>
                              {ability.abilityType}
                            </span>
                          </div>
                          <p className="ability-description">{ability.description}</p>
                          {(ability.cooldown > 0 || ability.damage > 0) && (
                            <div className="ability-stats">
                              {ability.cooldown > 0 && (
                                <div className="ability-stat">
                                  <span className="ability-stat-label">Cooldown</span>
                                  <span className="ability-stat-value">{ability.cooldown}s</span>
                                </div>
                              )}
                              {ability.damage > 0 && (
                                <div className="ability-stat">
                                  <span className="ability-stat-label">Damage</span>
                                  <span className="ability-stat-value">{ability.damage}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Col>

            <Col lg={4}>
              <div className="lore-section h-100">
                <div className="section-heading">
                  <p>Background</p>
                  <h2>Lore</h2>
                </div>
                <p className="lore-text">{character.lore}</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default CharacterDetail;
