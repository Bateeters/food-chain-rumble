import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages (we'll create these next)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Characters from './pages/Characters';
import CharacterDetail from './pages/CharacterDetail';
import Leaderboard from './pages/Leaderboard';
import Forum from './pages/Forum';
import ForumBoard from './pages/ForumBoard';
import ForumPost from './pages/ForumPost';

import './App.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/characters/:id" element={<CharacterDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path='/forum/posts/:postId' element={<ForumPost />} />
          <Route path='/forum/:slug' element={<ForumBoard />} />
          <Route path='/forum' element={<Forum />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;