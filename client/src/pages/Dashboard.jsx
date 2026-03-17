import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserStats, fetchRecentMatches } from '../store/slices/userStatsSlice';
import './Dashboard.css';
import CharacterIcon from '../components/character/CharacterIcon';
import MatchDetailModal from '../components/match/MatchDetailModal';

// Helper function to get rank tier and division from MMR
const getRankFromMMR = (mmr) => {
  if (mmr >= 2300) return { tier: 'Grandmaster', division: null, color: '#b19cd9' };
  if (mmr >= 2000) return { tier: 'Master', division: null, color: '#ff6b9d' };
  if (mmr >= 1800) return { tier: 'Diamond', division: Math.min(4, Math.max(1, 5 - Math.floor((mmr - 1800) / 50))), color: '#00d4ff' };
  if (mmr >= 1600) return { tier: 'Platinum', division: Math.min(4, Math.max(1, 5 - Math.floor((mmr - 1600) / 50))), color: '#4caf50' };
  if (mmr >= 1400) return { tier: 'Gold', division: Math.min(4, Math.max(1, 5 - Math.floor((mmr - 1400) / 50))), color: '#ffd700' };
  if (mmr >= 1200) return { tier: 'Silver', division: Math.min(4, Math.max(1, 5 - Math.floor((mmr - 1200) / 50))), color: '#c0c0c0' };
  return { tier: 'Bronze', division: Math.min(4, Math.max(1, 5 - Math.floor((mmr - 1000) / 50))), color: '#cd7f32' };
};

// Helper function to get rank icon/badge
const getRankIcon = (tier) => {
  const icons = {
    'Grandmaster': '👑',
    'Master': '💎',
    'Diamond': '💠',
    'Platinum': '⚜️',
    'Gold': '🏆',
    'Silver': '🥈',
    'Bronze': '🥉'
  };
  return icons[tier] || '🎮';
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, recentMatches, isLoading, error } = useSelector((state) => state.userStats);

  const [selectedMatch, setSelectedMatch] = useState(null);

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
            <div className='stat-content'>
              <div className='stat-value'>{stats?.totalWins || 0}W - {stats?.totalLosses}L</div>
              <br />
              <div className='stat-label'>Total Matches</div>
              <div className='stat-value'>{stats?.totalMatches || 0}</div>
              <br />
              <div className='stat-label'>Win Rate</div>
              <div className='stat-value'>{stats?.winRate || 0}%</div>
            </div>
          </div>

          <div className='rank-card'>
            {/* Rank Cards for Each Ranked Mode */}
            {['1v1_ranked', '2v2_ranked', '3v3_ranked'].map((mode) => {
              const modeStats = stats?.statsByMode?.[mode];
              const rank = getRankFromMMR(modeStats?.mmr ?? 0);
              const hasMatches = modeStats?.matches > 0;
              return (
                <div key={mode} className='rank-stat-card' style={{ backgroundColor: `${rank.color}20`, borderColor: rank.color }}>
                  <div className='rank-badge-large' style={{ borderColor: rank.color }}>
                    <div className='rank-icon'>{getRankIcon(rank.tier)}</div>
                    <div className='rank-info'>
                      <div className='rank-tier' style={{ color: rank.color }}>
                        {rank.tier}
                      </div>
                      {rank.division && (
                        <div className='rank-division'>{rank.division}</div>
                      )}
                    </div>
                  </div>
                  <div className='rank-mode-label'>
                    {mode.replace('_ranked', '').toUpperCase()}
                  </div>

                  {hasMatches && modeStats.rank && (
                    <div className='rank-position'>
                      #{modeStats.rank}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className='stat-card'>
            <div className='stat-content'>
              {/*
              <div className='stat-label'>K/D/A</div>
              <div className='stat-value'>{stats?.kda || 0}</div>
              */}
              <div className='stat-value'>K: {stats?.totalKills || 0} | D: {stats?.totalDeaths || 0} | A: {stats?.totalAssists || 0}</div>
              <div className='stat-label'>Total Damage Dealt</div>
              <div className='stat-value'>{stats?.totalDamageDealt || 0}</div>
              <br />
              <div className='stat-label'>Total Damage Taken</div>
              <div className='stat-value'>{stats?.totalDamageTaken || 0}</div>
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

                {/*
                <div className='mode-stat-row'>
                  <span className='mode-label'>MMR:</span>
                  <span className='mode-value highlight'>{Math.round(modeStats.mmr)}</span>
                </div>
                */}

                <div className='mode-stat-row'>
                  <span className='mode-label'>Current Leaderboard Rank:</span>
                  <span className='mode-value highlight'>
                    {modeStats.rank ? `${modeStats.rank}` : 'Unranked'}
                  </span>
                </div>
              </div>

            ))}
          </div>
        </div>

        {/* Top Characters */}
        <div className='top-characters-section'>
          <h2>Your Top Characters</h2>
          {stats?.topCharacters && stats.topCharacters.length > 0 ? (
            <div className='dashboard-characters-grid'>

              {stats.topCharacters.map((char, index) => (

                <div key={char._id} className='character-stat-card'>
                  <div className='character-rank'>#{index + 1}</div>
                  <div className='character-info'>
                    <div className='character-icon'>
                      <CharacterIcon character={char} />
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
                      <span className='char-stat-value'>{char.winRate}%</span>
                    </div>
                  </div>

                  <div className='character-stats'>
                    <div className='char-stat'>
                      <span className='char-stat-label'>Record:</span>
                      <span className='char-stat-value'>{char.wins}W - {char.losses}L</span>
                    </div>
                  </div>

{/*
                  <div className='character-stats'>
                    <div className='char-stat'>
                      <span className='char-stat-label'>Current MMR:</span>
                      <span className='char-stat-value highlight'>{Math.round(char.currentCharacterMMR)}</span>
                    </div>
                    <div>
                      <span className='char-stat-label'>Peak MMR:</span><br/>
                      <span className='char-stat-value highlight'>{Math.round(char.highestCharacterMMR)}</span>
                    </div>
                  </div>
*/}
                
                  <div className='character-stats'>
                    <div className='char-stat'>
                      <span className='char-stat-label'>Best Rank:</span>
                      <span className='char-stat-value highlight'>
                        {char.rank ? `#${char.rank}` : 'Unranked'}
                      </span>
                    </div>
                    {char.rankMode && (
                      <div className='char-stat'>
                        <span className='char-stat-label'>Mode:</span>
                        <span className='char-stat-value'>{char.rankMode.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    )}
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
                <div
                  key={match._id}
                  className={`match-card ${match.result}`}
                  onClick={() => setSelectedMatch(match)}
                  style={{ cursor:'pointer' }}  
                >
                  <div className='match-result'>
                    <div className={`result-badge ${match.result}`}>
                      {match.result === 'win' ? 'WIN' : 'LOSS'}
                    </div>
                  </div>

                  <div className='match-character'>
                    <div className='match-char-icon'>
                      <CharacterIcon character={match.character} />
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

      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          />
      )}
    </div> 
  );
};

export default Dashboard;