import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCharacters } from '../store/slices/characterSlice';
import CharacterCard from '../components/character/CharacterCard';
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
      <div className='characters-page'>
        <div className='loading'>Loading characters...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className='characters-page'>
        <div className='error'>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className='characters-page'>
      <div className='characters-container'>
        <div className='characters-header'>
          <h1>Choose Your Fighter</h1>
          <p>Select a character to deep dive into the roster.</p>
        </div>

        <div className='characters-grid'>
          {characters.map((character) => (
            <CharacterCard
              key={character._id}
              character={character}
              onClick={() => handleCharacterClick(character._id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
};

export default Characters;