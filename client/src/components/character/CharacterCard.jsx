import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import CharacterIcon from './CharacterIcon';
import './CharacterCard.css';

const CharacterCard = ({ character, onClick }) => {
  const getRoleVariant = (role) => {
    const variants = {
      tank: 'primary',
      fighter: 'danger',
      assassin: 'info',
      utility: 'warning',
    };
    return variants[role] || 'secondary';
  };

  const getDifficultyVariant = (difficulty) => {
    const variants = { 1: 'success', 2: 'warning', 3: 'danger' };
    return variants[difficulty] || 'secondary';
  };

  return (
    <Card className="character-card h-100 bg-dark" onClick={onClick}>
      <div className="character-card-header position-relative p-4 text-center">
        <div className="character-image-placeholder mx-auto mb-3">
          <CharacterIcon character={character} />
        </div>
        <Badge
          bg={getRoleVariant(character.role)}
          className="position-absolute top-0 end-0 m-2 text-uppercase"
        >
          {character.role}
        </Badge>
      </div>

      <Card.Body className="d-flex flex-column text-center">
        <Card.Title className="character-name">{character.name}</Card.Title>
        <Card.Text className="text-secondary small flex-grow-1">
          {character.description}
        </Card.Text>
        <div className="mt-auto pt-2">
          <Badge bg={getDifficultyVariant(character.difficulty)} className="px-3 py-2">
            Difficulty: {'★'.repeat(parseInt(character.difficulty))}
          </Badge>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CharacterCard;