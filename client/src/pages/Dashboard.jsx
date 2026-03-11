import React from 'react';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome, {user?.username}!</h1>
      <p>This is your dashboard. More features coming soon!</p>
    </div>
  );
};

export default Dashboard;