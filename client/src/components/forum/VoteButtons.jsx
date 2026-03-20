import React from 'react';
import { Button } from 'react-bootstrap';
import './VoteButtons.css';

const VoteButtons = ({ voteScore, userVote, onVote }) => {
  const handleUpvote = () => onVote(userVote === 'upvote' ? null : 'upvote');
  const handleDownvote = () => onVote(userVote === 'downvote' ? null : 'downvote');

  return (
    <div className="vote-buttons">
      <Button
        variant="link"
        className={`vote-btn upvote-btn ${userVote === 'upvote' ? 'active' : ''}`}
        onClick={handleUpvote}
        title="Upvote"
      >▲</Button>

      <span className={`vote-score ${voteScore > 0 ? 'positive' : voteScore < 0 ? 'negative' : ''}`}>
        {voteScore}
      </span>

      <Button
        variant="link"
        className={`vote-btn downvote-btn ${userVote === 'downvote' ? 'active' : ''}`}
        onClick={handleDownvote}
        title="Downvote"
      >▼</Button>
    </div>
  );
};

export default VoteButtons;