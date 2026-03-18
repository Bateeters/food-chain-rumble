import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
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

    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, postId]);

  const handleVote = (voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(voteOnPost({ postId, voteType }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async () => {
    const result = await dispatch(deletePost(postId));
    if (deletePost.fulfilled.match(result)) {
      navigate(`/forum/${currentPost.board?.slug}`);
    }
  };

  const isAuthor = user && currentPost && currentPost.author._id === user._id;
  const isModerator = user && (user.role === 'admin' || user.role === 'moderator');

  if (isLoading && !currentPost) {
    return (
      <div className='forum-post-page'>
        <div className='forum-post-container'>
          <div className='loading'>Loading post...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='forum-post-page'>
        <div className='forum-post-container'>
          <div className='error'>{error}</div>
        </div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className='forum-post-page'>
        <div className='forum-post-container'>
          <div className='error'>Post not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className='forum-post-page'>
      <div className='forum-post-container'>
        {/* Breadcrumb */}
        <div className='breadcrumb'>
          <span onClick={() => navigate('/forum')} className='breadcrumb-link'>
            Forum
          </span>
          <span className='breadcrumb-separator'>›</span>
          <span 
            onClick={() => navigate(`/forum/${currentPost.board?.slug}`)} 
            className='breadcrumb-link'
          >
            {currentPost.board?.name}
          </span>
          <span className='breadcrumb-separator'>›</span>
          <span className='breadcrumb-current'>Post</span>
        </div>

        {/* Post Container */}
        <div className='post-container'>
          {/* Post Header */}
          <div className='post-header'>
            <div className='post-header-left'>
              <h1 className='post-title-main'>
                {currentPost.title}
                {currentPost.isPinned && <span className='pinned-badge'>📌 Pinned</span>}
                {currentPost.isLocked && <span className='locked-badge'>🔒 Locked</span>}
              </h1>
              
              <div className='post-meta-info'>
                <UserAvatar user={currentPost.author} size='small' showUsername={true} />
                <span className='post-separator'>•</span>
                <span className='post-date'>{formatDate(currentPost.createdAt)}</span>
                {currentPost.editedAt && (
                  <>
                    <span className='post-separator'>•</span>
                    <span className='edited-label'>Edited</span>
                  </>
                )}
              </div>
            </div>

            <div className='post-header-right'>
              <div className='post-stats-small'>
                <span className='stat-item-small'>
                  <span className='stat-icon'>👁️</span>
                  {currentPost.stats?.viewCount || 0}
                </span>
                <span className='stat-item-small'>
                  <span className='stat-icon'>💬</span>
                  {currentPost.stats?.commentCount || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Post Body */}
          <div className='post-body'>
            <div className='post-vote-section'>
              <VoteButtons
                voteScore={currentPost.voteScore || 0}
                userVote={currentPost.userVote}
                onVote={handleVote}
              />
            </div>

            <div className='post-content-section'>
              <div className='post-content'>
                {currentPost.content}
              </div>

              {/* Post Actions */}
              {(isAuthor || isModerator) && (
                <div className='post-actions'>
                  {isAuthor && (
                    <button className='action-btn edit-btn'>
                      ✏️ Edit
                    </button>
                  )}
                  {(isAuthor || isModerator) && (
                    <button 
                      className='action-btn delete-btn'
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      🗑️ Delete
                    </button>
                  )}
                  {isModerator && (
                    <>
                      <button
                        className='action-btn mod-btn'
                        onClick={() => dispatch(togglePin(postId))}
                      >
                        {currentPost.isPinned ? '📌 Unpin' : '📌 Pin'}
                      </button>
                      <button
                        className='action-btn mod-btn'
                        onClick={() => dispatch(toggleLock(postId))}
                      >
                        {currentPost.isLocked ? '🔓 Unlock' : '🔒 Lock'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection
          postId={postId}
          comments={comments}
          isLocked={currentPost.isLocked}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className='modal-overlay' onClick={() => setShowDeleteConfirm(false)}>
            <div className='confirm-modal' onClick={(e) => e.stopPropagation()}>
              <h3>Delete Post?</h3>
              <p>Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className='confirm-actions'>
                <button className='cancel-btn' onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
                <button className='confirm-delete-btn' onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPost;