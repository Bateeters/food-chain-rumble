import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { createComment } from '../../store/slices/forumSlice';
import Comment from './Comment';

const CommentSection = ({ postId, comments, isLocked }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    await dispatch(createComment({ postId, commentData: { content: commentText } }));
    setCommentText('');
    setIsSubmitting(false);
  };

  return (
    <div>
      <h5 className="mb-3">Comments ({comments?.length || 0})</h5>

      {isLocked ? (
        <Alert variant="secondary" className="mb-4">
          🔒 This post is locked. No new comments can be added.
        </Alert>
      ) : user ? (
        <Form onSubmit={handleSubmit} className="mb-4">
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Share your thoughts..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            maxLength={5000}
            className="mb-2"
          />
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-secondary small">{commentText.length} / 5000</span>
            <Button className="px-3 py-1" type="submit" variant="primary" size="sm" disabled={!commentText.trim() || isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </Form>
      ) : (
        <Alert variant="secondary" className="mb-4">
          <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>
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
        <p className="text-secondary text-center py-3">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default CommentSection;