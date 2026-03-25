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
    if (!user) {
      navigate('/login');
      return;
    }
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
    <div className="forum-board-shell page-shell">
      <Container className="py-4 py-lg-5">
        <Row className="justify-content-center">
          <Col lg={11} xl={10}>
            <nav className="forum-breadcrumb mb-3 text-start">
              <span className="breadcrumb-link" onClick={() => navigate('/forum')}>Forum</span>
              <span className="breadcrumb-divider">/</span>
              <span>{currentBoard.name}</span>
            </nav>

            <div
              className="board-header mb-4"
              style={{ '--board-accent': currentBoard.color || 'var(--fcr-highlight)' }}
            >
              <div className="board-header-accent" />
              <Row className="align-items-center g-4">
                <Col xs={12} md={8} className="text-start">
                  <p className="board-header-kicker mb-2">Discussion Board</p>
                  <h1 className="board-header-title mb-2">{currentBoard.name}</h1>
                  <p className="board-header-description mb-0">{currentBoard.description}</p>
                </Col>
                <Col xs={12} md={4}>
                  <div className="board-header-actions">
                    <div className="board-stat-panel">
                      <span className="board-stat-value">{postsPagination.total || 0}</span>
                      <span className="board-stat-label">Active threads</span>
                    </div>
                    <Button variant="primary" className="forum-create-button" onClick={handleCreatePost}>
                      Start New Post
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>

            <div className="board-toolbar mb-3">
              <ButtonGroup size="sm" className="forum-sort-group">
                {['latest', 'popular', 'oldest'].map((opt) => (
                  <Button
                    key={opt}
                    variant="outline-primary"
                    className={sortBy === opt ? 'active' : ''}
                    onClick={() => setSortBy(opt)}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Button>
                ))}
              </ButtonGroup>
              <span className="board-toolbar-count">{postsPagination.total || 0} posts</span>
            </div>

            {posts && posts.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className={`post-row ${post.isPinned ? 'pinned-post' : ''}`}
                    onClick={() => handlePostClick(post._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="post-row-accent" />
                    <div className="post-row-avatar d-none d-md-block">
                      <UserAvatar user={post.author} size="medium" />
                    </div>

                    <div className="post-row-main">
                      <div className="post-row-tags">
                        {post.isPinned && <Badge bg="warning" text="dark">Pinned</Badge>}
                        {post.isLocked && <Badge bg="danger">Locked</Badge>}
                      </div>
                      <h2 className="post-row-title">{post.title}</h2>
                      <div className="post-row-meta">
                        <span>{post.author?.username || 'Unknown user'}</span>
                        <span className="post-row-dot" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>

                    <div className="post-row-stats">
                      <span>Comments {post.stats?.commentCount || 0}</span>
                      <span>Views {post.stats?.viewCount || 0}</span>
                      <span>Score {post.voteScore || 0}</span>
                    </div>

                    <span className="post-row-cta">View thread</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="forum-empty-state text-center">
                <h4>No posts yet</h4>
                <p>Be the first to open a discussion in this board.</p>
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
    </div>
  );
};

export default ForumBoard;
