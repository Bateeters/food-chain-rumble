import React from 'react';
import './UserAvatar.css';

const UserAvatar = ({ user, size = 'medium', showUsername = false }) => {
  // Generate initials from username
  const getInitials = (username) => {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  };

  // Generate consistent color from username
  const getColorFromUsername = (username) => {
    if (!username) return '#00d4ff';
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#00d4ff', '#ff6b9d', '#4caf50', '#ffd700', 
      '#b19cd9', '#ff9800', '#e91e63', '#9c27b0',
      '#00bcd4', '#8bc34a', '#ffeb3b', '#ff5722'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const username = user?.username || 'Unknown';
  const avatar = user?.avatar;
  const bgColor = getColorFromUsername(username);

  return (
    <div className={`user-avatar-container ${showUsername ? 'with-username' : ''}`}>
      <div className={`user-avatar ${size}`} style={{ backgroundColor: bgColor }}>
        {avatar ? (
          <img src={avatar} alt={username} />
        ) : (
          <span className='avatar-initials'>{getInitials(username)}</span>
        )}
      </div>
      {showUsername && <span className='avatar-username'>{username}</span>}
    </div>
  );
};

export default UserAvatar;