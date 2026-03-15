import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createComment } from '../../store/slices/forumSlice';
import Comment from './Comment';
import './CommentSection.css';

const CommentSection = ({ postId, comments, isLocked }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { createCommentSuccess } = useSelector((state) => state.forum);

  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    await dispatch(createComment({
      postId,
      commentData: { content: commentText }
    }));

    if (createCommentSuccess) {
      setCommentText('');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className='comment-section'>
      <div className='comment-section-header'>
        <h2>Comments ({comments?.length || 0})</h2>
      </div>

      {/* Comment Form */}
      {!isLocked ? (
        <div className='comment-form-container'>
          {user ? (
            <form className='comment-form' onSubmit={handleSubmit}>
              <textarea
                className='comment-textarea'
                placeholder='Share your thoughts...'
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                maxLength={5000}
              />
              <div className='comment-form-footer'>
                <span className='char-count'>
                  {commentText.length} / 5000
                </span>
                <button
                  type='submit'
                  className='submit-comment-btn'
                  disabled={!commentText.trim() || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className='login-prompt'>
              <p>
                <span onClick={() => navigate('/login')} className='login-link'>
                  Log in
                </span>{' '}
                to join the discussion
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className='locked-message'>
          🔒 This post is locked. No new comments can be added.
        </div>
      )}

      {/* Comments List */}
      <div className='comments-list'>
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <Comment key={comment._id} comment={comment} postId={postId} />
          ))
        ) : (
          <div className='no-comments'>
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;