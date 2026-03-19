import React from 'react';
import { useSelector } from 'react-redux';
import './MatchDetailModal.css';
import CharacterIcon from '../character/CharacterIcon';

const MatchDetailModal = ({ match, onClose }) => {
    const { user } = useSelector((state) => state.auth);
    if (!match) return null;

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const team1Players = match.players.filter(p => p.team === 1);
    const team2Players = match.players.filter(p => p.team === 2);

    const didUserWin = match.result === 'win';
    const isTeam1Winner = match.winningTeam === 1;

    return (
        <div className='modal-overlay' onClick={onClose}>
            <div className='match-detail-modal' onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className='modal-close' onClick={onClose}>
                    ✕
                </button>

                {/* Match Header */}
                <div className={`match-header ${didUserWin ? 'team1-won' : 'team2-won'}`}>
                    <div className='match-result'>
                        <span className='result-icon'>{didUserWin ? '✓' : '✗'}</span>
                        <span className='result-text'>
                            {didUserWin ? 'VICTORY' : 'DEFEAT'}
                        </span>
                    </div>
                    <div className='match-mode'>{match.gameMode.replace('_', ' ').toUpperCase()}</div>
                    <div className='match-date'>{formatDate(match.endedAt)}</div>
                </div>

                {/* Match Info Bar */}
                <div className='match-info-bar'>
                    <div className='info-item'>
                        <span className='info-label'>Duration:</span>
                        <span className='info-value'>{formatDuration(match.duration)}</span>
                    </div>
                    <div className='info-item'>
                        <span className='info-label'>Arena:</span>
                        <span className='info-value'>{match.arena}</span>
                    </div>
                    <div className='info-item'>
                        <span className='info-label'>Region:</span>
                        <span className='info-value'>{match.serverRegion}</span>
                    </div>
                </div>

                {/* Teams */}
                <div className='teams-container'>
                    {/* Team 1 */}
                    <div className={`team-section ${isTeam1Winner ? 'winner' : ''}`}>
                        <div className='team-header'>
                            <h3>Team 1</h3>
                            {isTeam1Winner && <span className='winner-badge'>🏆 WINNER</span>}
                        </div>
                        <div className='players-table'>
                            <div className='table-header'>
                                <div className='col-player'>Player</div>
                                <div className='col-character'>Character</div>
                                <div className='col-kda'>K/D/A</div>
                                <div className='col-damage'>Damage Dealt</div>
                                <div className='col-damage'>Damage Taken</div>
                            </div>
                            {team1Players.map((player, idx) => (
                                <div key={idx} className={`player-row ${player.user?._id === user?._id ? 'current-user-row' : ''}`}>
                                    <div className='col-player'>
                                        <span className='player-name'>{player.user?.username || 'Unknown'}</span>
                                    </div>
                                    <div className='col-character'>
                                        <div className='match-detail-char-icon'>
                                            <CharacterIcon character={player.character} />
                                        </div>
                                        <span className='character-name'>{player.character?.name || 'Unknown'}</span>
                                    </div>
                                    <div className='col-kda'>
                                        <span className='kda-stats'>
                                            {player.stats.kills}/{player.stats.deaths}/{player.stats.assists}
                                        </span>
                                    </div>
                                    <div className='col-damage'>
                                        <span className='damage-dealt'>{player.stats.damageDealt.toLocaleString()}</span>
                                    </div>
                                    <div className='col-damage'>
                                        <span className='damage-taken'>{player.stats.damageTaken.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* VS Divider */}
                    <div className='vs-divider'>VS</div>

                    {/* Team 2 */}
                    <div className={`team-section ${!isTeam1Winner ? 'winner' : ''}`}>
                        <div className='team-header'>
                            <h3>Team 2</h3>
                            {!isTeam1Winner && <span className='winner-badge'>🏆 WINNER</span>}
                        </div>
                        <div className='players-table'>
                            <div className='table-header'>
                                <div className='col-player'>Player</div>
                                <div className='col-character'>Character</div>
                                <div className='col-kda'>K/D/A</div>
                                <div className='col-damage'>Damage Dealt</div>
                                <div className='col-damage'>Damage Taken</div>
                            </div>
                            {team2Players.map((player, idx) => (
                                <div key={idx} className={`player-row ${player.user?._id === user?._id ? 'current-user-row' : ''}`}>
                                    <div className='col-player'>
                                        <span className='player-name'>{player.user?.username || 'Unknown'}</span>
                                    </div>
                                    <div className='col-character'>
                                        <div className='match-detail-char-icon'>
                                            <CharacterIcon character={player.character} />
                                        </div>
                                        <span className='character-name'>{player.character?.name || 'Unknown'}</span>
                                    </div>
                                    <div className='col-kda'>
                                        <span className='kda-stats'>
                                            {player.stats.kills}/{player.stats.deaths}/{player.stats.assists}
                                        </span>
                                    </div>
                                    <div className='col-damage'>
                                        <span className='damage-dealt'>{player.stats.damageDealt.toLocaleString()}</span>
                                    </div>
                                    <div className='col-damage'>
                                        <span className='damage-taken'>{player.stats.damageTaken.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchDetailModal;