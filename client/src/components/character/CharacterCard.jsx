import React, { useMemo, useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import CharacterIcon from './CharacterIcon';
import './CharacterCard.css';

const CharacterCard = ({ character, onClick }) => {
  const [bannerMissing, setBannerMissing] = useState(false);

  const getDifficultyVariant = (difficulty) => {
    const variants = { 1: 'success', 2: 'warning', 3: 'danger' };
    return variants[difficulty] || 'secondary';
  };

  const bannerPath = useMemo(() => {
    const slug = character.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return `/images/${slug}-banner.png`;
  }, [character.name]);

  return (
    <Card className="character-card h-100" onClick={onClick}>
      <div className="character-card-banner">
        {!bannerMissing && (
          <img
            src={bannerPath}
            alt={`${character.name} banner`}
            onError={() => setBannerMissing(true)}
          />
        )}
      </div>
      <div className="character-card-header position-relative p-4">
        <Badge className="character-role-badge text-uppercase">
          {character.role}
        </Badge>
        <div className="character-image-placeholder mb-3">
          <CharacterIcon character={character} />
        </div>
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="character-name">{character.name}</Card.Title>
        <Card.Text className="text-secondary small flex-grow-1">
          {character.description}
        </Card.Text>
        <div className="character-card-footer mt-auto pt-3 d-flex justify-content-between align-items-center gap-3">
          <Badge bg={getDifficultyVariant(character.difficulty)} className="px-3 py-2">
            Difficulty: {'*'.repeat(parseInt(character.difficulty, 10))}
          </Badge>
          <span className="character-card-link">View Details</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CharacterCard;
