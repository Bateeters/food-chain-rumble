aimport React from "react";
import './CharacterCard.css';

const CharacterCard = ({ character, onClick }) => {
    const getRoleColor = (role) => {
        const colors = {
            'tank': '#3498db',
            'fighter': '#e74c3c',
            'assassin': '#9b59b6',
            'utility': '#e67e22',
        };
        return colors[role] || '#95a5a6';
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            1 : '#2ecc71',
            2 : '#f39c12',
            3 : '#e74c3c'
        };
        return colors[difficulty] || '#95a5a6';
    };

    return (
        <div className='character-card' onClick={onClick}>
            <div className='character-card-header'>
                <div className='character-image-container'>
                    <div className='character-image-placeholder'>
                        {character.name.charAt(0)}
                    </div>
                </div>
                <div
                    className='character-role-badge'
                    style={{ backgroundColor: getRoleColor(character.role) }}
                >
                    {character.role}
                </div>
            </div>

            <div className='character-body-card'>
                <h3 className='character-name'>{character.name}</h3>
                <p className='character-description'>{character.description}</p>

                <div className='character-difficulty'>
                    <span
                        className='difficulty-badge'
                        style={{ backgroundColor: getDifficultyColor(character.difficulty) }}
                    >
                        {character.difficulty.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CharacterCard;