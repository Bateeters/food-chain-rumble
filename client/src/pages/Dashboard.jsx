import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { fetchUserStats, fetchRecentMatches } from '../store/slices/userStatsSlice';
import './Dashboard.css';
import CharacterIcon from '../components/character/CharacterIcon';
import MatchDetailModal from '../components/match/MatchDetailModal';

const getRankFromMMR = (mmr) => {
  if (mmr >= 2300) return { tier: 'Grandmaster', division: null, color: '#b19cd9' };
  if (mmr >= 2000) return { tier: 'Master', division: null, color: '#ff6b9d' };
  if (mmr >= 1800) return { tier: 'Diamond', division: Math.min(4, Math.max(1, 5 - Math.floor((mmr - 1800) / 50))), color: '#00d4ff' };
  if (mmr >= 1600) return { tier: 'Platinum', division: Math.min(4, Math.max(1, 5 - Math.floor((mmr - 1600) / 50))), color: '#4caf50' };
  if (mmr >= 1400) return { tier: 'Gold', division: Math.min(4, Math.max(1, 5 - Math.floor((mmr - 1400) / 50))), color: '#ffd700' };
  if (mmr >= 1200) return { tier: 'Silver', division: Math.min(4, Math.max(1, 5 - Math.floor((mmr - 1200) / 50))), color: '#c0c0c0' };
  return { tier: 'Bronze', division: Math.min(4, Math.max(1, 5 - Math.floor((mmr - 1000) / 50))), color: '#cd7f32' };
};

const getRankIcon = (tier) => {
  const icons = {
    Grandmaster: 'GM',
    Master: 'M',
    Diamond: 'D',
    Platinum: 'P',
    Gold: 'G',
    Silver: 'S',
    Bronze: 'B'
  };
  return icons[tier] || 'R';
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
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8}><Alert variant="danger">{error}</Alert></Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="page-shell">
      <Container className="py-4">
        <Row className="mb-4">
          <Col className="text-center">
            <h1 className="dashboard-title">Welcome back, {user?.username}!</h1>
            <p className="text-secondary">Here&apos;s how you&apos;ve been performing</p>
          </Col>
        </Row>

        <Row className="g-3 mb-4">
          <Col xs={12}>
            <Row className="g-3 h-100">
              {['1v1_ranked', '2v2_ranked', '3v3_ranked'].map((mode) => {
                const modeStats = stats?.statsByMode?.[mode];
                const rank = getRankFromMMR(modeStats?.mmr ?? 0);
                const hasMatches = modeStats?.matches > 0;
                return (
                  <Col key={mode} xs={12} sm={4} className="d-flex">
                    <div className="rank-stat-card w-100 flex-row flex-wrap justify-content-center" style={{ backgroundColor: `${rank.color}20`, borderColor: rank.color }}>
                      <div className="rank-badge-large flex-wrap justify-content-center">
                        <div className="rank-icon">{getRankIcon(rank.tier)}</div>
                        <div className="rank-info">
                          <div className="rank-tier" style={{ color: rank.color }}>{rank.tier}</div>
                          {rank.division && <div className="rank-division" style={{ color: rank.color }}>DIVISION {rank.division}</div>}
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="rank-mode-label">{mode.replace('_ranked', '').toUpperCase()}</div>
                        {hasMatches && modeStats.rank && (
                          <div className="rank-position">#{modeStats.rank}</div>
                        )}
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </Col>
          <Col xs={12}>
            <div className="stat-card h-100">
              <Row className="align-items-center justify-content-center gap-5 text-center">
                <div class="w-auto">
                  <div className="stat-label">Total Matches</div>
                  <div className="stat-value">{stats?.totalMatches || 0}</div>
                </div>
                <div class="w-auto">
                  <div className="stat-label">Win Rate</div>
                  <div className="stat-value">{stats?.winRate || 0}%</div>
                </div>
                <div className="stat-value w-auto">
                  {stats?.totalWins || 0}W - {stats?.totalLosses || 0}L
                </div>
                <div className="stat-value w-auto">
                  K: {stats?.totalKills || 0} | D: {stats?.totalDeaths || 0} | A: {stats?.totalAssists || 0}
                </div>
                <div className="w-auto">
                  <div className="stat-label">Total Damage Dealt</div>
                  <div className="stat-value">{(stats?.totalDamageDealt || 0).toLocaleString()}</div>
                </div>
                <div className="w-auto">
                  <div className="stat-label">Total Damage Taken</div>
                  <div className="stat-value">{(stats?.totalDamageTaken || 0).toLocaleString()}</div>
                </div>
              </Row>
            </div>
          </Col>
        </Row>

        <h2 className="section-title text-center mt-5 mb-3">Performance by Game Mode</h2>
        <Row className="g-3 mb-4">
          {stats?.statsByMode && Object.entries(stats.statsByMode).map(([mode, modeStats]) => (
            <Col key={mode} xs={12} md={4}>
              <div className="mode-card h-100">
                <h3>{mode.replace('_', ' ').toUpperCase()}</h3>
                <div className="mode-stat-row">
                  <span className="mode-label">Matches:</span>
                  <span className="mode-value">{modeStats.matches}</span>
                </div>
                <div className="mode-stat-row">
                  <span className="mode-label">Record:</span>
                  <span className="mode-value">{modeStats.wins}W - {modeStats.losses}L</span>
                </div>
                <div className="mode-stat-row">
                  <span className="mode-label">Win Rate:</span>
                  <span className="mode-value">
                    {modeStats.matches > 0 ? ((modeStats.wins / modeStats.matches) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="mode-stat-row">
                  <span className="mode-label">Rank:</span>
                  <span className="mode-value highlight">
                    {modeStats.rank ? `#${modeStats.rank}` : 'Unranked'}
                  </span>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <h2 className="section-title text-center mt-5 mb-3">Your Top Characters</h2>
        {stats?.topCharacters && stats.topCharacters.length > 0 ? (
          <Row className="g-3 mb-4">
            {stats.topCharacters.map((char, index) => (
              <Col key={char._id} md={12} lg={4}>
                <div className="character-stat-card h-100">
                  <div className="character-info d-flex flex-wrap justify-content-center align-items-center mb-3 pb-3">
                    <div className="character-rank col-1">#{index + 1}</div>
                    <h3 className="mb-0 col-sm-7 col-12 p-3">{char.name}</h3>
                    <div className="character-icon col-2">
                      <div style={{ width: '50px', height: '50px'}}>
                        <CharacterIcon character={char} />
                      </div>
                    </div>
                  </div>
                  <Row className="g-2">
                    <Col xs={6}>
                      <div className="char-stat">
                        <span className="char-stat-label">Matches</span>
                        <span className="char-stat-value">{char.matches}</span>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="char-stat">
                        <span className="char-stat-label">Win Rate</span>
                        <span className="char-stat-value">{char.winRate}%</span>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="char-stat">
                        <span className="char-stat-label">Record</span>
                        <span className="char-stat-value">{char.wins}W - {char.losses}L</span>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="char-stat">
                        <span className="char-stat-label">Best Rank</span>
                        <span className="char-stat-value highlight">
                          {char.rank ? `#${char.rank}` : 'Unranked'}
                        </span>
                      </div>
                    </Col>
                    {char.rankMode && (
                      <Col xs={12}>
                        <div className="char-stat">
                          <span className="char-stat-label">Mode</span>
                          <span className="char-stat-value">{char.rankMode.replace('_', ' ').toUpperCase()}</span>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <div className="empty-state mb-4">
            <p>Play some matches to see your character stats!</p>
          </div>
        )}

        <h2 className="section-title text-center mt-5 mb-3">Recent Matches</h2>
        {recentMatches && recentMatches.length > 0 ? (
          <div className="d-flex flex-column gap-3 mb-4">
            {recentMatches.map((match) => (
              <div
                key={match._id}
                className={`match-card p-3 rounded d-flex align-items-center gap-3 flex-wrap ${match.result}`}
                onClick={() => setSelectedMatch(match)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`result-badge ${match.result}`}>
                  {match.result === 'win' ? 'WIN' : 'LOSS'}
                </div>

                <div className="d-flex align-items-center gap-2 flex-grow-1">
                  <div className="match-char-icon">
                    <div style={{ width: '50px', height: '50px'}}>
                      <CharacterIcon character={match.character} />
                    </div>
                  </div>
                  <span className="match-char-name">{match.character.name}</span>
                </div>

                <div className="text-end">
                  <div className="small text-uppercase">
                    {match.gameMode.replace('_', ' ')}
                  </div>
                  <div className="match-kda">{match.stats.kills}/{match.stats.deaths}/{match.stats.assists}</div>
                  <div className="text-secondary small">{Math.round(match.stats.damageDealt).toLocaleString()} DMG</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state mb-4">
            <p>No matches played yet. Time to jump into the wilderness!</p>
          </div>
        )}

        {selectedMatch && (
          <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
