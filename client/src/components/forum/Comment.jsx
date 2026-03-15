import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { voteOnComment, createComment } from '../../store/slices/forumSlice';
import UserAvatar from '../user/UserAvatar';
import VoteButtons from './VoteButtons';
import './Comment.css';

const Comment = ({ comment, postId, isReply = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleVote = (voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(voteOnComment({ commentId: comment._id, voteType }));
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (!replyText.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    await dispatch(createComment({
      postId,
      commentData: {
        content: replyText,
        parentCommentId: comment._id
      }
    }));

    setReplyText('');
    setShowReplyForm(false);
    setIsSubmitting(false);
  };

  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInHours = Math.floor((now - commentDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return commentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: commentDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const isAuthor = user && comment.author._id === user._id;
  const isModerator = user && (user.role === 'admin' || user.role === 'moderator');
  const voteScore = comment.voteScore || 0;

  console.log('💬 Comment voteScore:', {
    commentId: comment._id,
    voteScore,
    userVote: comment.userVote,
    upvotes: comment.votes?.upvotes?.length,
    downvotes: comment.votes?.downvotes?.length
  });

  return (
    <div className={`comment ${isReply ? 'comment-reply' : ''}`}>
      <div className='comment-vote'>
        <VoteButtons
          voteScore={voteScore}
          userVote={comment.userVote}
          onVote={handleVote}
        />
      </div>

      <div className='comment-main'>
        <div className='comment-header'>
          <UserAvatar user={comment.author} size='small' showUsername={true} />
          <span className='comment-separator'>•</span>
          <span className='comment-date'>{formatDate(comment.createdAt)}</span>
          {comment.editedAt && (
            <>
              <span className='comment-separator'>•</span>
              <span className='edited-label'>Edited</span>
            </>
          )}
        </div>

        <div className='comment-content'>
          {comment.content}
        </div>

        <div className='comment-actions'>
          {!isReply && user && (
            <button 
              className='comment-action-btn'
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              💬 Reply
            </button>
          )}
          
          {isAuthor && (
            <button className='comment-action-btn'>
              ✏️ Edit
            </button>
          )}
          
          {(isAuthor || isModerator) && (
            <button 
              className='comment-action-btn delete'
              onClick={() => setShowDeleteConfirm(true)}
            >
              🗑️ Delete
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <form className='reply-form' onSubmit={handleReplySubmit}>
            <textarea
              className='reply-textarea'
              placeholder='Write a reply...'
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              maxLength={5000}
              autoFocus
            />
            <div className='reply-form-footer'>
              <span className='char-count'>{replyText.length} / 5000</span>
              <div className='reply-buttons'>
                <button
                  type='button'
                  className='cancel-reply-btn'
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyText('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='submit-reply-btn'
                  disabled={!replyText.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className='replies-container'>
            {comment.replies.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                postId={postId}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className='modal-overlay' onClick={() => setShowDeleteConfirm(false)}>
          <div className='confirm-modal' onClick={(e) => e.stopPropagation()}>
            <h3>Delete Comment?</h3>
            <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div className='confirm-actions'>
              <button className='cancel-btn' onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className='confirm-delete-btn'>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comment;