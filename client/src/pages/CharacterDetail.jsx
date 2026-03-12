import React, { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCharacterById, clearSelectedCharacter } from '../store/slices/characterSlice';
import './CharacterDetail.css';

const CharacterDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedCharacter: character, isLoading, error } = useSelector(
        (state) => state.characters
    );

    useEffect(() => {
        dispatch(fetchCharacterById(id));

        // Cleanup when component unmounts
        return () => {
            dispatch(clearSelectedCharacter());
        };
    }, [dispatch, id]);

    const getRoleColor = (role) => {
        const colors = {
            'tank': '#3498db',
            'fighter': '#e74c3c',
            'assassin': '#9b59b6',
            'utility': '#e67e22',
        };
        return colors[role] || '#95a5a6';
    };

    const getAbilityTypeColor = (type) => {
        const colors = {
            'active': '#e74c3c',
            'ultimate': '#9b59b6',
            'passive': '#b1e255'
        };
        return colors[type] || '#95a5a6';
    };

    if (isLoading) {
        return (
            <div className="character-detail-page">
                <div className="loading">Loading character...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="character-detail-page">
                <div className="error-container">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/characters')} className="btn-back">
                        Back to Characters
                    </button>
                </div>
            </div>
        );
    }

    if (!character) {
        return null;
    }

    return (
        <div className="character-detail-page">
            <div className="character-detail-container">
                {/* Back Button */}
                <button onClick={() => navigate('/characters')} className="btn-back-top">
                    Back to Characters
                </button>

                {/* Header Section */}
                <div className="character-header">
                    <div className="character-image-large">
                        {character.name.charAt(0)}
                    </div>
                    <div className="character-header-info">
                        <h1 className="character-title">{character.name}</h1>
                        <div
                            className="role-badge-large"
                            style={{ backgroundColor: getRoleColor(character.role) }}
                        >
                            {character.role}
                        </div>
                        <p className="character-tagline">{character.description}</p>
                    </div>
                </div>

                {/* Abilities Section */}
                <div className="abilities-section">
                    <h2>Abilities</h2>
                    <div className="abilities-grid">
                        {character.abilities.map((ability, index) => (
                            <div key={index} className="ability-card">
                                <div className="ability-header">
                                    <h3 className="ability-name">{ability.name}</h3>
                                    <span
                                        className="ability-type-badge"
                                        style={{ backgroundColor: getAbilityTypeColor(ability.abilityType) }}
                                    >
                                        {ability.abilityType}
                                    </span>
                                </div>
                                <p className="ability-description">{ability.description}</p>
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
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lore Section */}
                <div className="lore-section">
                    <h2>Lore</h2>
                    <p className="lore-text">{character.lore}</p>
                </div>
            </div>
        </div>
    );
};

export default CharacterDetail;