import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { fetchAllBoards } from '../store/slices/forumSlice';
import './Forum.css';

const Forum = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards, isLoading, error } = useSelector((state) => state.forum);

  useEffect(() => {
    dispatch(fetchAllBoards());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}><Alert variant="danger">{error}</Alert></Col>
        </Row>
      </Container>
    );
  }

  return (
    <div className="forum-shell page-shell">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10} xl={9}>
            <section className="forum-hero text-center mb-5">
              <p className="forum-kicker">Community Intel</p>
              <h1 className="forum-title">Food Chain Forum</h1>
              <p className="forum-subtitle">
                Strategy breakdowns, matchup talk, roster theory, and community discussion all live here.
              </p>
              <div className="forum-hero-meta justify-content-center">
                <span className="forum-meta-pill">{boards?.length || 0} boards</span>
                <span className="forum-meta-pill">Competitive discussion</span>
                <span className="forum-meta-pill">Build sharing</span>
              </div>
            </section>

            {boards && boards.length > 0 ? (
              <div className="d-flex flex-column gap-4">
                {boards.map((board) => (
                  <div
                    key={board._id}
                    className="board-card"
                    style={{ '--board-accent': board.color || 'var(--fcr-highlight)', cursor: 'pointer' }}
                    onClick={() => navigate(`/forum/${board.slug}`)}
                  >
                    <div className="board-card-accent" />
                    <div className="board-icon">
                      {board.icon ? (
                        <img src={board.icon} alt={board.name} width={40} height={40} />
                      ) : (
                        <span className="board-icon-fallback">{board.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>

                    <div className="board-content">
                      <div className="board-label-row">
                        <span className="board-chip">Board</span>
                        <span className="board-post-count">{board.postCount || 0} posts</span>
                      </div>
                      <h2 className="board-name">{board.name}</h2>
                      <p className="board-description">{board.description}</p>
                      <div className="board-footer">
                        <span className="board-footnote">
                          {board.recentPost ? `Latest: ${board.recentPost.title}` : 'No discussions yet'}
                        </span>
                        <span className="board-cta">Open board</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="forum-empty-state text-center">
                <h4>No forum boards yet</h4>
                <p>Check back soon for the first discussion hubs.</p>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Forum;
