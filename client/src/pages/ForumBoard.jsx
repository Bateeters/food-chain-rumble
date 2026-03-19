import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, ButtonGroup, Spinner, Alert, Badge } from 'react-bootstrap';
import { fetchBoardBySlug, fetchPostsInBoard, clearPosts } from '../store/slices/forumSlice';
import UserAvatar from '../components/user/UserAvatar';
import CreatePostModal from '../components/forum/CreatePostModal';
import './ForumBoard.css';

const ForumBoard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();

  const { currentBoard, posts, postsPagination, isLoading, error } = useSelector((state) => state.forum);
  const { user } = useSelector((state) => state.auth);

  const [sortBy, setSortBy] = useState('latest');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(clearPosts());
      dispatch(fetchBoardBySlug(slug));
    }
    return () => { dispatch(clearPosts()); };
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentBoard && currentBoard.slug === slug) {
      dispatch(fetchPostsInBoard({ boardId: currentBoard._id, params: { sort: sortBy, page: 1, limit: 20 } }));
    }
  }, [dispatch, currentBoard, sortBy, slug]);

  const handlePostClick = (postId) => navigate(`/forum/posts/${postId}`);

  const handleCreatePost = () => {
    if (!user) { navigate('/login'); return; }
    setShowCreateModal(true);
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 5) return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
  };

  if (isLoading && !currentBoard) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!currentBoard) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Board not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
      <Col lg={10}>

      {/* Breadcrumb */}
      <nav className="mb-3 text-secondary small text-start">
        <span className="breadcrumb-link" onClick={() => navigate('/forum')}>Forum</span>
        <span className="mx-2">›</span>
        <span>{currentBoard.name}</span>
      </nav>

      {/* Board Header */}
      <div className="board-header d-flex flex-wrap justify-content-between text-start align-items-center mb-4 p-3 rounded"
        style={{ borderLeft: `4px solid ${currentBoard.color || '#00d4ff'}` }}>
        <div className='col-12 col-md-7'>
          <h2 className="mb-1">{currentBoard.name}</h2>
          <p className="text-secondary mb-0 small">{currentBoard.description}</p>
        </div>
        <div className='ms-auto pt-md-0 pt-3'>
          <Button variant="primary" className='py-1 px-3' onClick={handleCreatePost}>+ New Post</Button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <ButtonGroup size="sm">
          {['latest', 'popular', 'oldest'].map((opt) => (
            <Button
              key={opt}
              variant="outline-primary"
              className={`py-1 px-3 ${sortBy === opt ? 'active' : ''}`}
              onClick={() => setSortBy(opt)}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </Button>
          ))}
        </ButtonGroup>
        <span className="text-secondary small">{postsPagination.total || 0} posts</span>
      </div>

      {/* Posts List */}
      {posts && posts.length > 0 ? (
        <div className="d-flex flex-column gap-2">
          {posts.map((post) => (
            <div
              key={post._id}
              className={`post-row d-flex flex-wrap align-items-center gap-3 p-3 rounded ${post.isPinned ? 'pinned-post' : ''}`}
              onClick={() => handlePostClick(post._id)}
              style={{ cursor: 'pointer' }}
            >
              <div className='d-none d-md-block'>
                <UserAvatar user={post.author} size="medium"/>
              </div>

              <div className="flex-grow-1 min-width-0 col-12 col-md-7">
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  {post.isPinned && <Badge bg="warning" text="dark">📌 Pinned</Badge>}
                  <span className="fw-semibold">
                    {post.title}
                    {post.isLocked && <span className="ms-1">🔒</span>}
                  </span>
                </div>
                <div className="text-secondary small text-start">
                  <span>{post.author?.username}</span>
                  <span className="mx-1">•</span>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>

              <div className="d-flex gap-3 text-secondary small flex-shrink-0">
                <span>💬 {post.stats?.commentCount || 0}</span>
                <span>👁️ {post.stats?.viewCount || 0}</span>
                <span>👍 {post.voteScore || 0}</span>
              </div>

              <span className="text-secondary">→</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-secondary py-5">
          <h4>No posts yet</h4>
          <p>Be the first to start a discussion!</p>
          <Button variant="primary" onClick={handleCreatePost}>Create First Post</Button>
        </div>
      )}

      {postsPagination.pages > 1 && (
        <p className="text-center text-secondary mt-4 small">
          Page {postsPagination.page} of {postsPagination.pages}
        </p>
      )}

      {showCreateModal && (
        <CreatePostModal boardId={currentBoard._id} onClose={() => setShowCreateModal(false)} />
      )}

      </Col>
      </Row>
    </Container>
  );
};

export default ForumBoard;