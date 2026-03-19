import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Badge, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import { fetchPostById, fetchComments, voteOnPost, deletePost, togglePin, toggleLock, clearCurrentPost } from '../store/slices/forumSlice';
import UserAvatar from '../components/user/UserAvatar';
import CommentSection from '../components/forum/CommentSection';
import VoteButtons from '../components/forum/VoteButtons';
import './ForumPost.css';

const ForumPost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { postId } = useParams();

  const { currentPost, comments, isLoading, error } = useSelector((state) => state.forum);
  const { user } = useSelector((state) => state.auth);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId));
      dispatch(fetchComments({ postId, params: { page: 1, limit: 50 } }));
    }
    return () => { dispatch(clearCurrentPost()); };
  }, [dispatch, postId]);

  const handleVote = (voteType) => {
    if (!user) { navigate('/login'); return; }
    dispatch(voteOnPost({ postId, voteType }));
  };

  const handleDelete = async () => {
    const result = await dispatch(deletePost(postId));
    if (deletePost.fulfilled.match(result)) {
      navigate(`/forum/${currentPost.board?.slug}`);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const isAuthor = user && currentPost && currentPost.author?._id === user._id;
  const isModerator = user && (user.role === 'admin' || user.role === 'moderator');

  if (isLoading && !currentPost) {
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

  if (!currentPost) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Post not found.</Alert>
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
        <span className="breadcrumb-link" onClick={() => navigate(`/forum/${currentPost.board?.slug}`)}>
          {currentPost.board?.name}
        </span>
        <span className="mx-2">›</span>
        <span>Post</span>
      </nav>

      {/* Post Card */}
      <div className="post-card mb-4">

        {/* Post Header */}
        <div className="post-card-header d-flex justify-content-between align-items-start gap-3 flex-wrap">
          <div>
            <h1 className="post-title-main mb-2 text-start">
              {currentPost.title}
              {currentPost.isPinned && <Badge bg="warning" text="dark" className="ms-2 fs-6">📌 Pinned</Badge>}
              {currentPost.isLocked && <Badge bg="danger" className="ms-2 fs-6">🔒 Locked</Badge>}
            </h1>
            <div className="d-flex align-items-center gap-2 flex-wrap text-secondary small">
              <div className='d-none d-md-block'>
                <UserAvatar user={currentPost.author} size="small" showUsername={true} />
              </div>
              <span>•</span>
              <span>{formatDate(currentPost.createdAt)}</span>
              {currentPost.editedAt && <><span>•</span><span className="fst-italic">Edited</span></>}
            </div>
          </div>

          <div className="d-flex gap-3 text-secondary small">
            <span>👁️ {currentPost.stats?.viewCount || 0}</span>
            <span>💬 {currentPost.stats?.commentCount || 0}</span>
          </div>
        </div>

        {/* Post Body */}
        <div className="d-flex gap-3 p-3">
          <div className="flex-shrink-0">
            <VoteButtons
              voteScore={currentPost.voteScore || 0}
              userVote={currentPost.userVote}
              onVote={handleVote}
            />
          </div>

          <div className="flex-grow-1 min-width-0">
            <p className="post-content text-start">{currentPost.content}</p>

            {(isAuthor || isModerator) && (
              <div className="d-flex gap-2 flex-wrap pt-3 border-top">
                {isAuthor && (
                  <Button variant="outline-secondary" size="sm">✏️ Edit</Button>
                )}
                {(isAuthor || isModerator) && (
                  <Button variant="outline-danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                    🗑️ Delete
                  </Button>
                )}
                {isModerator && (
                  <>
                    <Button variant="outline-warning" size="sm" onClick={() => dispatch(togglePin(postId))}>
                      {currentPost.isPinned ? '📌 Unpin' : '📌 Pin'}
                    </Button>
                    <Button variant="outline-warning" size="sm" onClick={() => dispatch(toggleLock(postId))}>
                      {currentPost.isLocked ? '🔓 Unlock' : '🔒 Lock'}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments */}
      <CommentSection
        postId={postId}
        comments={comments}
        isLocked={currentPost.isLocked}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Post?</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this post? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>

      </Col>
      </Row>
    </Container>
  );
};

export default ForumPost;