import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOverallLeaderboard, fetchCharacterLeaderboard } from '../store/slices/leaderboardSlice';
import { fetchCharacters } from '../store/slices/characterSlice';
import './Leaderboard.css';

const Leaderboard = () => {
  const dispatch = useDispatch();
  const { rankings, pagination, isLoading, error } = useSelector(
    (state) => state.leaderboard
  );
  const { characters } = useSelector((state) => state.characters);

  const [viewMode, setViewMode] = useState('overall'); // 'overall' or 'character'
  const [selectedGameMode, setSelectedGameMode] = useState('1v1_ranked') // Default to 1v1 ranked
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // Fetch characters for dropdown
  useEffect(() => {
    if (characters.length === 0) {
      dispatch(fetchCharacters());
    }
  }, [dispatch, characters.length]);

  // Fetch leaderboard data
  useEffect(() => {
    if (viewMode === 'overall') {
      dispatch(fetchOverallLeaderboard({ gameMode: selectedGameMode, page: 1, limit: 100 }));
    } else if (viewMode === 'character' && selectedCharacter) {
      dispatch(fetchCharacterLeaderboard({
        characterId: selectedCharacter,
        gameMode: selectedGameMode,
        page: 1,
        limit: 100
      }));
    }
  }, [dispatch, viewMode, selectedGameMode, selectedCharacter]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'overall') {
      setSelectedCharacter(null);
    }
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return '#ffd700';
    if (rank === 2) return '#c0c0c0';
    if (rank === 3) return '#cd7f32';
    return '#00d4ff';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  // TEST FUNCTION
  const testFetch = async () => {
    console.log('🧪 Test button clicked');
    try {
      const result = await dispatch(fetchOverallLeaderboard({ 
        gameMode: '1v1_ranked', 
        page: 1, 
        limit: 100 
      }));
      console.log('🧪 Test result:', result);
    } catch (error) {
      console.error('🧪 Test error:', error);
    }
  };
  return (
    <div className='leaderboard-page'>
      <button onClick={testFetch} style={{position: 'fixed', top: '100px', right: '20px', zIndex: 9999}}>
        TEST FETCH
      </button>
      <div className='leaderboard-container'>
        <div className='leaderboard-header'>
          <h1>Leaderboard</h1>
          <p>Top players across all game modes</p>
        </div>

        {/* Filters */}
        <div className='leaderboard-filters'>
          {/* View Mode Toggle */}
          <div className='filter-group'>
            <label>View:</label>
            <div className='button-group'>
              <button
                className={viewMode === 'overall' ? 'active' : ''}
                onClick={() => handleViewModeChange('overall')}
              >
                Overall
              </button>
              <button
                className={viewMode === 'character' ? 'active' : ''}
                onClick={() => handleViewModeChange('character')}
              >
                By Character
              </button>
            </div>
          </div>

          {/* Game Mode Filter */}
          <div className='filter-group'>
            <label>Game Mode:</label>
            <div className='button-group'>
              <button
                className={selectedGameMode === '1v1_ranked' ? 'active' : ''}
                onClick={() => setSelectedGameMode('1v1_ranked')}
              >
                1v1
              </button>
              <button
                className={selectedGameMode === '2v2_ranked' ? 'active' : ''}
                onClick={() => setSelectedGameMode('2v2_ranked')}
              >
                2v2
              </button>
              <button
                className={selectedGameMode === '3v3_ranked' ? 'active' : ''}
                onClick={() => setSelectedGameMode('3v3_ranked')}
              >
                3v3
              </button>
            </div>
          </div>

          {/* Character filter (only show in character view mode) */}
          {viewMode === 'character' && (
            <div className='filter-group'>
              <label>Character:</label>
              <select
                value={selectedCharacter || ''}
                onChange={(e) => setSelectedCharacter(e.target.value)}
                className='character-select'
              >
                <option value="">Select a character...</option>
                {characters.map((char) => (
                  <option key={char._id} value={char._id}>
                    {char.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Leaderboard Table */}
        <div className='leaderboard-content'>
          {isLoading ? (
            <div className='loading'>Loading leaderboard...</div>
          ): error ? (
            <div className='error'>{error}</div>
          ) : rankings.length === 0 ? (
            <div className='empty-state'>
              <h3>No rankings yet</h3>
              <p>Be the first to compete and claim your spot!</p>
            </div>
          ) : (
            <div className='leaderboard-table-wrapper'>
              <table className='leaderboard-table'>
                <thead>
                  <tr>
                    <th className='rank-col'>Rank</th>
                    <th className='player-col'>Player</th>
                    {viewMode === 'character' && <th className='character-col'>Character</th>}
                    <th className='mmr-col'>MMR</th>
                    <th className='games-col'>Games</th>
                    <th className='wins-col'>Wins</th>
                    <th className='winrate-col'>Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((player, index) => {
                    const rank = (pagination.currentPage - 1) * 100 + index + 1;
                    return (
                      <tr key={player._id || index} className={rank <= 3 ? 'top-three': ''}>
                        <td className='rank-col'>
                          <div
                            className='rank-badge'
                            style={{ backgroundColor: getRankBadgeColor(rank) }}
                          >
                            {getRankIcon(rank)} {rank}
                          </div>
                        </td>
                        <td className='player-col'>
                          <div className='player-info'>
                            <span className='player-name'>{player.username}</span>
                          </div>
                        </td>
                        {viewMode === 'character' && (
                          <td className='character-col'>{player.characterName || 'N/A'}</td>
                        )}
                        <td className='mmr-col'>
                          <span className='mmr-value'>{Math.round(player.mmr || player.rating || 1000)}</span>
                        </td>
                        <td className='games-col'>{player.gamesPlayed || 0}</td>
                        <td className='wins-col'>{player.wins || 0}</td>
                        <td className='wins-col'>
                          <span>{player.gamesPlayed > 0
                            ? `${((player.wins / player.gamesPlayed) * 100).toFixed(1)}%`
                            : '0%'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Info */}
          {rankings.length > 0 && (
            <div className='leaderboard-footer'>
              <p>
                Showing {rankings.length} of {pagination.totalPlayers} players
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;