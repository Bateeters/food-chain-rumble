import React from 'react';
import './VoteButtons.css';

const VoteButtons = ({ voteScore, userVote, onVote }) => {
  const handleUpvote = () => {
    onVote(userVote === 'upvote' ? null : 'upvote');
  };

  const handleDownvote = () => {
    onVote(userVote === 'downvote' ? null : 'downvote');
  };

  return (
    <div className='vote-buttons'>
      <button
        className={`vote-btn upvote-btn ${userVote === 'upvote' ? 'active' : ''}`}
        onClick={handleUpvote}
        title='Upvote'
      >
        ▲
      </button>
      
      <span className={`vote-score ${voteScore > 0 ? 'positive' : voteScore < 0 ? 'negative' : ''}`}>
        {voteScore}
      </span>
      
      <button
        className={`vote-btn downvote-btn ${userVote === 'downvote' ? 'active' : ''}`}
        onClick={handleDownvote}
        title='Downvote'
      >
        ▼
      </button>
    </div>
  );
};

export default VoteButtons;