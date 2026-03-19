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
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>

          <div className="text-center mb-5">
            <h1 className="fw-bold">Community Forum</h1>
            <p className="text-secondary">Discuss strategies, share builds, and connect with the community</p>
          </div>

          {boards && boards.length > 0 ? (
            <div className="d-flex flex-column gap-3">
              {boards.map((board) => (
                <div
                  key={board._id}
                  className="board-card d-flex align-items-center gap-3 p-3 rounded"
                  style={{ borderLeft: `4px solid ${board.color || '#00d4ff'}`, cursor: 'pointer' }}
                  onClick={() => navigate(`/forum/${board.slug}`)}
                >
                  <div className="board-icon fs-2">
                    {board.icon ? <img src={board.icon} alt={board.name} width={40} /> : '💬'}
                  </div>

                  <div className="text-start flex-grow-1 min-width-0">
                    <h5 className="mb-1">{board.name}</h5>
                    <p className="text-secondary small mb-1">{board.description}</p>
                    <div className="d-flex gap-3 text-secondary small flex-wrap">
                      <span>📝 {board.postCount || 0} posts</span>
                      {board.recentPost && (
                        <span>
                          Last: <strong>{board.recentPost.title}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-secondary flex-shrink-0">→</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-secondary py-5">
              <h4>No forum boards yet</h4>
              <p>Check back soon!</p>
            </div>
          )}

        </Col>
      </Row>
    </Container>
  );
};

export default Forum;
