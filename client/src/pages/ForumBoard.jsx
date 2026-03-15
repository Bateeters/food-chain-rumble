import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBoardBySlug, fetchPostsInBoard } from '../store/slices/forumSlice';
import UserAvatar from '../components/user/UserAvatar';
import './ForumBoard.css';
import CreatePostModal from '../components/forum/CreatePostModal';

const ForumBoard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();
  
  const { currentBoard, posts, postsPagination, isLoading, error } = useSelector(
    (state) => state.forum
  );
  const { user } = useSelector((state) => state.auth);

  const [sortBy, setSortBy] = useState('latest');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchBoardBySlug(slug));
    }
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentBoard) {
      dispatch(fetchPostsInBoard({
        boardId: currentBoard._id,
        params: { sort: sortBy, page: 1, limit: 20 }
      }));
    }
  }, [dispatch, currentBoard, sortBy]);

  const handlePostClick = (postId) => {
    navigate(`/forum/posts/${postId}`);
  };

  const handleCreatePost = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowCreateModal(true);
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (isLoading && !currentBoard) {
    return (
      <div className='forum-board-page'>
        <div className='forum-board-container'>
          <div className='loading'>Loading board...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='forum-board-page'>
        <div className='forum-board-container'>
          <div className='error'>{error}</div>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className='forum-board-page'>
        <div className='forum-board-container'>
          <div className='error'>Board not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className='forum-board-page'>
      <div className='forum-board-container'>
        {/* Breadcrumb */}
        <div className='breadcrumb'>
          <span onClick={() => navigate('/forum')} className='breadcrumb-link'>
            Forum
          </span>
          <span className='breadcrumb-separator'>›</span>
          <span className='breadcrumb-current'>{currentBoard.name}</span>
        </div>

        {/* Board Header */}
        <div className='board-header' style={{ borderLeftColor: currentBoard.color }}>
          <div className='board-header-info'>
            <h1>{currentBoard.name}</h1>
            <p>{currentBoard.description}</p>
          </div>
          <button className='create-post-btn' onClick={handleCreatePost}>
            + New Post
          </button>
        </div>

        {/* Sorting & Filters */}
        <div className='board-controls'>
          <div className='sort-options'>
            <button
              className={`sort-btn ${sortBy === 'latest' ? 'active' : ''}`}
              onClick={() => setSortBy('latest')}
            >
              Latest
            </button>
            <button
              className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
              onClick={() => setSortBy('popular')}
            >
              Popular
            </button>
            <button
              className={`sort-btn ${sortBy === 'oldest' ? 'active' : ''}`}
              onClick={() => setSortBy('oldest')}
            >
              Oldest
            </button>
          </div>

          <div className='board-stats-summary'>
            <span>{postsPagination.total || 0} posts</span>
          </div>
        </div>

        {/* Posts List */}
        <div className='posts-list'>
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post._id}
                className={`post-card ${post.isPinned ? 'pinned' : ''}`}
                onClick={() => handlePostClick(post._id)}
              >
                {post.isPinned && (
                  <div className='pinned-badge'>
                    📌 Pinned
                  </div>
                )}

                <div className='post-card-left'>
                  <UserAvatar user={post.author} size='medium' />
                </div>

                <div className='post-card-main'>
                  <div className='post-card-header'>
                    <h3 className='post-title'>
                      {post.title}
                      {post.isLocked && <span className='locked-icon'>🔒</span>}
                    </h3>
                    <div className='post-meta'>
                      <span className='post-author'>{post.author?.username}</span>
                      <span className='post-separator'>•</span>
                      <span className='post-date'>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>

                  <div className='post-card-stats'>
                    <span className='post-stat'>
                      <span className='stat-icon'>💬</span>
                      {post.stats?.commentCount || 0} replies
                    </span>
                    <span className='post-stat'>
                      <span className='stat-icon'>👁️</span>
                      {post.stats?.viewCount || 0} views
                    </span>
                    <span className='post-stat'>
                      <span className='stat-icon'>👍</span>
                      {post.voteScore || 0}
                    </span>
                  </div>
                </div>

                <div className='post-card-arrow'>→</div>
              </div>
            ))
          ) : (
            <div className='empty-state'>
              <h3>No posts yet</h3>
              <p>Be the first to start a discussion!</p>
              <button className='create-post-btn' onClick={handleCreatePost}>
                Create First Post
              </button>
            </div>
          )}
        </div>

        {/* Pagination (if needed) */}
        {postsPagination.pages > 1 && (
          <div className='pagination'>
            <span>Page {postsPagination.page} of {postsPagination.pages}</span>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          boardId={currentBoard._id}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default ForumBoard;