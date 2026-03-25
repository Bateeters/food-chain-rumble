import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { createComment } from '../../store/slices/forumSlice';
import Comment from './Comment';
import './CommentSection.css';

const CommentSection = ({ postId, comments, isLocked }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    await dispatch(createComment({ postId, commentData: { content: commentText } }));
    setCommentText('');
    setIsSubmitting(false);
  };

  return (
    <section className="comment-section-shell">
      <div className="comment-section-header">
        <p className="comment-section-kicker mb-2">Thread Activity</p>
        <h2 className="comment-section-title mb-0">Comments ({comments?.length || 0})</h2>
      </div>

      {isLocked ? (
        <Alert variant="secondary" className="forum-inline-alert mb-4">
          This post is locked. No new comments can be added.
        </Alert>
      ) : user ? (
        <Form onSubmit={handleSubmit} className="comment-composer mb-4">
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Share your thoughts..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={5000}
            className="comment-composer-input mb-2"
          />
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span className="text-secondary small">{commentText.length} / 5000</span>
            <Button className="px-3 py-2" type="submit" variant="primary" size="sm" disabled={!commentText.trim() || isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </Form>
      ) : (
        <Alert variant="secondary" className="forum-inline-alert mb-4">
          <span className="comment-login-link" onClick={() => navigate('/login')}>
            Log in
          </span>{' '}to join the discussion
        </Alert>
      )}

      {comments && comments.length > 0 ? (
        <div className="d-flex flex-column gap-3">
          {comments.map((comment) => (
            <Comment key={comment._id} comment={comment} postId={postId} />
          ))}
        </div>
      ) : (
        <p className="text-secondary text-center py-3">No comments yet. Be the first to comment.</p>
      )}
    </section>
  );
};

export default CommentSection;
