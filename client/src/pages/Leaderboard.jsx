import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, ButtonGroup, Button, Form, Spinner, Alert, Table } from 'react-bootstrap';
import { fetchOverallLeaderboard, fetchCharacterLeaderboard, clearLeaderboard } from '../store/slices/leaderboardSlice';
import { fetchCharacters } from '../store/slices/characterSlice';
import './Leaderboard.css';
import CharacterIcon from '../components/character/CharacterIcon';

const Leaderboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { rankings, pagination, isLoading, error } = useSelector((state) => state.leaderboard);
  const { characters } = useSelector((state) => state.characters);

  const [viewMode, setViewMode] = useState('overall');
  const [selectedGameMode, setSelectedGameMode] = useState('1v1_ranked');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRankings = rankings
    .map((player, index) => ({ ...player, _rank: (pagination.currentPage - 1) * 100 + index + 1 }))
    .filter(player => player.username.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    if (characters.length === 0) dispatch(fetchCharacters());
  }, [dispatch, characters.length]);

  useEffect(() => {
    dispatch(clearLeaderboard());
    if (viewMode === 'overall') {
      dispatch(fetchOverallLeaderboard({ gameMode: selectedGameMode, page: 1, limit: 100 }));
    } else if (viewMode === 'character' && selectedCharacter) {
      dispatch(fetchCharacterLeaderboard({ characterId: selectedCharacter, gameMode: selectedGameMode, page: 1, limit: 100 }));
    }
  }, [dispatch, viewMode, selectedGameMode, selectedCharacter]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (mode === 'overall') setSelectedCharacter(null);
  };

  const handleCharacterClick = (id) => navigate(`/characters/${id}`);

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

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={10}>

          {/* Header */}
          <div className="leaderboard-header">
            <h1>Leaderboard</h1>
            <p>Top players across all game modes</p>
          </div>

          {/* Filters */}
          <div className="leaderboard-filters d-flex flex-wrap align-items-center gap-3 mb-4">
            <div className="d-flex align-items-center gap-2">
              <span className="filter-label">View:</span>
              <ButtonGroup size="sm">
                {['overall', 'character'].map((mode) => (
                  <Button
                    key={mode}
                    variant="outline-primary"
                    className={viewMode === mode ? 'active' : ''}
                    onClick={() => handleViewModeChange(mode)}
                  >
                    {mode === 'overall' ? 'Overall' : 'By Character'}
                  </Button>
                ))}
              </ButtonGroup>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="filter-label">Mode:</span>
              <ButtonGroup size="sm">
                {[['1v1_ranked', '1v1'], ['2v2_ranked', '2v2'], ['3v3_ranked', '3v3']].map(([val, label]) => (
                  <Button
                    key={val}
                    variant="outline-primary"
                    className={selectedGameMode === val ? 'active' : ''}
                    onClick={() => setSelectedGameMode(val)}
                  >
                    {label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>

            <Form.Control
              type="text"
              placeholder="Search username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="leaderboard-search"
            />

            {viewMode === 'character' && (
              <Form.Select
                value={selectedCharacter || ''}
                onChange={(e) => setSelectedCharacter(e.target.value)}
                className="character-select"
              >
                <option value="">Select a character...</option>
                {characters.map((char) => (
                  <option key={char._id} value={char._id}>{char.name}</option>
                ))}
              </Form.Select>
            )}
          </div>

          {/* Leaderboard Content */}
          <div className="leaderboard-content">
            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : filteredRankings.length === 0 ? (
              <div className="empty-state">
                <h3>No rankings yet</h3>
                <p>Be the first to compete and claim your spot!</p>
              </div>
            ) : (
              <div className="leaderboard-table-wrapper">
                <Table className="leaderboard-table mb-0">
                  <thead>
                    <tr>
                      <th className="rank-col">Rank</th>
                      <th className="player-col">Player</th>
                      {viewMode === 'overall' && <th className="character-col">Top Characters</th>}
                      <th className="mmr-col">MMR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRankings.map((player) => {
                      const rank = player._rank;
                      return (
                        <tr key={player._id || rank} className={rank <= 3 ? 'top-three' : ''}>
                          <td className="rank-col">
                            <div className="rank-badge" style={{ backgroundColor: getRankBadgeColor(rank) }}>
                              {getRankIcon(rank)} {rank}
                            </div>
                          </td>
                          <td className="player-col">
                            <div className="player-info">
                              <span className="player-name">{player.username}</span>
                            </div>
                          </td>
                          {viewMode === 'overall' && (
                            <td className="character-col">
                              <div className="top-characters">
                                {player.topCharacters?.slice(0, 3).map((char, idx) => (
                                  <div key={idx} className="character-mini" title={`${char.name}: ${char.mmr} MMR`}>
                                    <div className="character-mini-icon" onClick={() => handleCharacterClick(char._id)}>
                                      <CharacterIcon character={char} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          )}
                          <td className="mmr-col">
                            <span className="mmr-value">{Math.round(player.mmr || player.rating)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}

            {filteredRankings.length > 0 && (
              <div className="leaderboard-footer">
                <p>Showing {filteredRankings.length} of {pagination.totalPlayers} players</p>
              </div>
            )}
          </div>

        </Col>
      </Row>
    </Container>
  );
};

export default Leaderboard;