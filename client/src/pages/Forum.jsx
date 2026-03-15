import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllBoards } from '../store/slices/forumSlice';
import './Forum.css';

const Forum = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards, isLoading, error } = useSelector((state) => state.forum);

  useEffect(() => {
    dispatch(fetchAllBoards());
  }, [dispatch]);

  const handleBoardClick = (slug) => {
    navigate(`/forum/${slug}`);
  };

  if (isLoading) {
    return (
      <div className='forum-page'>
        <div className='forum-container'>
          <div className='loading'>Loading forum boards...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='forum-page'>
        <div className='forum-container'>
          <div className='error'>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className='forum-page'>
      <div className='forum-container'>
        <div className='forum-header'>
          <h1>Community Forum</h1>
          <p>Discuss strategies, share builds, and connect with the community</p>
        </div>

        <div className='boards-list'>
          {boards && boards.length > 0 ? (
            boards.map((board) => (
              <div
                key={board._id}
                className='board-card'
                onClick={() => handleBoardClick(board.slug)}
                style={{ borderLeftColor: board.color }}
              >
                <div className='board-icon'>
                  {board.icon ? (
                    <img src={board.icon} alt={board.name} />
                  ) : (
                    <span className='board-icon-fallback'>💬</span>
                  )}
                </div>

                <div className='board-info'>
                  <h3>{board.name}</h3>
                  <p className='board-description'>{board.description}</p>
                  
                  <div className='board-stats'>
                    <span className='stat-item'>
                      <span className='stat-icon'>📝</span>
                      {board.postCount || 0} posts
                    </span>
                    {board.recentPost && (
                      <span className='stat-item recent-post'>
                        Last: <strong>{board.recentPost.title}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className='board-arrow'>→</div>
              </div>
            ))
          ) : (
            <div className='empty-state'>
              <h3>No forum boards yet</h3>
              <p>Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;