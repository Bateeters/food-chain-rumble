import React from 'react';
import './VoteButtons.css';

const VoteButtons = ({ voteScore, userVote, onVote }) => {
  console.log('🎨 VoteButtons props:', { voteScore, userVote });
  
  const handleUpvote = () => {
    const newVote = userVote === 'upvote' ? null : 'upvote';
    console.log('⬆️ Upvote clicked. Current:', userVote, '→ Sending:', newVote);
    onVote(newVote);
  };

  const handleDownvote = () => {
    const newVote = userVote === 'downvote' ? null : 'downvote';
    console.log('⬇️ Downvote clicked. Current:', userVote, '→ Sending:', newVote);
    onVote(newVote);
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