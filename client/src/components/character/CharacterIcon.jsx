import React from "react";
import './CharacterIcon.css';

const CharacterIcon = ({ character }) => {
    return (
        <div className='character-image-space' 
        style={{ 
            background: `linear-gradient(135deg, ${character.primaryColor} 0%, ${character.secondaryColor} 100%)`,
            color: character.textColor,
        }}>
            {character.name.charAt(0)}
        </div>
    );
};

export default CharacterIcon;