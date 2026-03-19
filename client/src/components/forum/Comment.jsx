import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Modal } from 'react-bootstrap';
import { voteOnComment, createComment, updateComment, deleteComment } from '../../store/slices/forumSlice';
import UserAvatar from '../user/UserAvatar';
import VoteButtons from './VoteButtons';

const Comment = ({ comment, postId, isReply = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);

  const handleVote = (voteType) => {
    if (!user) { navigate('/login'); return; }
    dispatch(voteOnComment({ commentId: comment._id, voteType }));
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    await dispatch(createComment({ postId, commentData: { content: replyText, parentCommentId: comment._id } }));
    setReplyText('');
    setShowReplyForm(false);
    setIsSubmitting(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setIsSubmitting(true);
    try {
      await dispatch(updateComment({ commentId: comment._id, commentData: { content: editText.trim() } })).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteComment(comment._id)).unwrap();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diffInHours = Math.floor((now - d) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // optional chaining prevents crash when author is null
  const isAuthor = user && comment.author?._id === user._id;
  const isModerator = user && (user.role === 'admin' || user.role === 'moderator');

  return (
    <div className="pt-3" style={{ borderTop:'1px solid #444444'}}>
      <div className={`d-flex gap-3 ${isReply ? 'ms-4 ps-3 border-start' : ''}`}>
        <div className="flex-shrink-0">
          <VoteButtons voteScore={comment.voteScore || 0} userVote={comment.userVote} onVote={handleVote} />
        </div>

        <div className="flex-grow-1 min-width-0">
          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <div className='d-none d-md-block'>
              <UserAvatar user={comment.author} size="small" showUsername={true} />
            </div>
            <span className="text-secondary">•</span>
            <span className="text-secondary small">{formatDate(comment.createdAt)}</span>
            {comment.editedAt && <span className="text-secondary small fst-italic">• Edited</span>}
          </div>

          {isEditing ? (
            <Form onSubmit={handleEditSubmit} className="mb-2">
              <Form.Control
                as="textarea"
                rows={4}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={5000}
                autoFocus
                className="mb-1"
              />
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary small">{editText.length} / 5000</span>
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" size="sm" type="button"
                    onClick={() => { setEditText(comment.content); setIsEditing(false); }}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit"
                    disabled={!editText.trim() || isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </Form>
          ) : (
            <p className="mb-2 text-start" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {comment.content}
            </p>
          )}

          <div className="d-flex gap-2 mb-2">
            {!isReply && user && (
              <Button variant="link" size="sm" className="p-0 text-secondary"
                onClick={() => setShowReplyForm(!showReplyForm)}>
                💬 Reply
              </Button>
            )}
            {isAuthor && !isEditing && (
              <Button variant="link" size="sm" className="p-0 text-secondary"
                onClick={() => setIsEditing(true)}>
                ✏️ Edit
              </Button>
            )}
            {(isAuthor || isModerator) && !isEditing && (
              <Button variant="link" size="sm" className="p-0 text-danger"
                onClick={() => setShowDeleteConfirm(true)}>
                🗑️ Delete
              </Button>
            )}
          </div>

          {showReplyForm && (
            <Form onSubmit={handleReplySubmit} className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                maxLength={5000}
                autoFocus
                className="mb-1"
              />
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-secondary small">{replyText.length} / 5000</span>
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" size="sm" type="button"
                    onClick={() => { setShowReplyForm(false); setReplyText(''); }}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit"
                    disabled={!replyText.trim() || isSubmitting}>
                    {isSubmitting ? 'Posting...' : 'Reply'}
                  </Button>
                </div>
              </div>
            </Form>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="d-flex flex-column gap-3 mt-2">
              {comment.replies.map((reply) => (
                <Comment key={reply._id} comment={reply} postId={postId} isReply={true} />
              ))}
            </div>
          )}
        </div>

        <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered size="sm">
          <Modal.Header closeButton>
            <Modal.Title>Delete Comment?</Modal.Title>
          </Modal.Header>
          <Modal.Body>This action cannot be undone.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Comment;