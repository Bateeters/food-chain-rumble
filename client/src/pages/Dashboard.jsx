import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserStats, fetchRecentMatches } from '../store/slices/userStatsSlice';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, recentMatches, isLoading, error } = useSelector((state) => state.userStats);

  useEffect(() => {
    dispatch(fetchUserStats());
    dispatch(fetchRecentMatches(10));
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className='dashboard-page'>
        <div className='dashboard-container'>
          <div className='loading'>Loading your stats...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='dashboard-page'>
        <div className='dashboard-container'>
          <div className='error'>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard-page'>
      <div className='dashboard-container'>
        {/* Welcome Section */}
        <div className='dashboard-header'>
          <h1>Welcome back, {user?.username}!</h1>
          <p>Here's how you've been performing</p>
        </div>

        {/* Stats Overview Cards */}
        <div className='stats-overview'>
          <div className='stat-card'>
            <div className='stat-icon'>total matches icon</div>
            <div className='stat-content'>
              <div className='stat-label'>Total Matches</div>
              <div className='stat-value'>{stats?.totalMatches || 0}</div>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-icon'>wins icon</div>
            <div className='stat-content'>
              <div className='stat-label'>Wins</div>
              <div className='stat-value'>{stats?.totalWins || 0}</div>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-icon'>Win Rate Icon</div>
            <div className='stat-content'>
              <div className='stat-label'>Win Rate</div>
              <div className='stat-value'>{stats?.winRate || 0}%</div>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-icon'>K/D/A Icon</div>
            <div className='stat-content'>
              <div className='stat-label'>K/D/A</div>
              <div className='stat-value'>{stats?.kda || 0}</div>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-icon'>Peak MMR Icon</div>
            <div className='stat-content'>
              <div className='stat-label'>Peak MMR</div>
              <div className='stat-value'>{stats?.highestMMR || 1000}</div>
            </div>
          </div>
        </div>

        {/* Stats by Game Mode */}
        <div className='game-mode-stats'>
          <h2>Performance by Game Mode</h2>
          <div className='mode-cards'>

            {stats?.statsByMode && Object.entries(stats.statsByMode).map(([mode, modeStats]) => (

              <div key={mode} className='mode-card'>
                <h3>{mode.replace('_', ' ').toUpperCase()}</h3>

                <div className='mode-stat-row'>
                  <span className='mode-label'>Matches:</span>
                  <span className='mode-value'>{modeStats.matches}</span>
                </div>

                <div className='mode-stat-row'>
                  <span className='mode-label'>Record:</span>
                  <span className='mode-value'>{modeStats.wins}W - {modeStats.losses}L</span>
                </div>

                <div className='mode-stat-row'>
                  <span className='mode-label'>Win Rate:</span>
                  <span className='mode-value'>
                    {modeStats.matches > 0 ? ((modeStats.wins / modeStats.matches) * 100).toFixed(1): 0}%
                  </span>
                </div>

                <div className='mode-stat-row'>
                  <span className='mode-label'>MMR:</span>
                  <span className='mode-value highlight'>{Math.round(modeStats.mmr)}</span>
                </div>
              </div>

            ))}
          </div>
        </div>

        {/* Top Characters */}
        <div className='top-characters-section'>
          <h2>Your Top Characters</h2>
          {stats?.topCharacters && stats.topCharacters.length > 0 ? (
            <div className='characters-grid'>

              {stats.topCharacters.map((char, index) => (

                <div key={char._id} className='character-stat-card'>
                  <div className='character-rank'>#{index + 1}</div>
                  <div className='character-info'>
                    <div className='character-icon'>
                      {char.name.charAt(0)}
                    </div>
                    <h3>{char.name}</h3>
                  </div>

                  <div className='character-stats'>
                    <div className='char-stat'>
                      <span className='char-stat-label'>Matches:</span>
                      <span className='char-stat-value'>{char.matches}</span>
                    </div>
                  </div>

                  <div className='character-stats'>
                    <div className='char-stat'>
                      <span className='char-stat-label'>Win Rate:</span>
                      <span className='char-stat-value'>{char.winRate}</span>
                    </div>
                  </div>

                  <div className='character-stats'>
                    <div className='char-stat'>
                      <span className='char-stat-label'>Record:</span>
                      <span className='char-stat-value'>{char.wins}W - {char.losses}L</span>
                    </div>
                  </div>

                  <div className='character-stats'>
                    <div className='char-stat'>
                      <span className='char-stat-label'>Best MMR:</span>
                      <span className='char-stat-value highlight'>{Math.round(char.highestMMR)}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className='empty-state'>
              <p>Play some matches to see your character stats!</p>
            </div>
          )}
        </div>

        {/* Recent Matches */}
        <div className='recent-matches-section'>
          <h2>Recent Matches</h2>
          {recentMatches && recentMatches.length > 0 ? (
            <div className='matches-list'>
              {recentMatches.map((match) => (
                <div key={match._id} className={`match-card ${match.result}`}>
                  <div className='match-result'>
                    <div className={`result-badge ${match.result}`}>
                      {match.result === 'win' ? 'WIN' : 'LOSS'}
                    </div>
                  </div>

                  <div className='match-character'>
                    <div className='match-char-icon'>
                      {match.character.name.charAt(0)}
                    </div>
                    <span className='match-char-name'>{match.character.name}</span>
                  </div>

                  <div className='match-mode'>
                    {match.gameMode.replace('_', ' ').toUpperCase()}
                  </div>

                  <div className='match-stats'>
                    <span className='match-kda'>
                      {match.stats.kills}/{match.stats.deaths}/{match.stats.assists}
                    </span>
                    <span className='match-damage'>
                      {Math.round(match.stats.damageDealt).toLocaleString()} DMG
                    </span>
                  </div>

                  <div className='match-time'>
                    {new Date(match.endedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='empty-state'>
              <p>No matches played yet. Time to jump into the wilderness!</p>
            </div>
          )}
        </div>
      </div>
    </div> 
  );
};

export default Dashboard;