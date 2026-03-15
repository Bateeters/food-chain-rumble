import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost, clearCreateSuccess } from '../../store/slices/forumSlice';
import { useNavigate } from 'react-router-dom';
import './CreatePostModal.css';

const CreatePostModal = ({ boardId, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, createPostSuccess, error } = useSelector((state) => state.forum);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      return;
    }

    const result = await dispatch(createPost({
      boardId,
      postData: { title: title.trim(), content: content.trim() }
    }));

    if (result.type === 'forum/createPost/fulfilled') {
      // Redirect to the new post
      const newPost = result.payload.post;
      dispatch(clearCreateSuccess());
      navigate(`/forum/posts/${newPost._id}`);
    }
  };

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='create-post-modal' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>Create New Post</h2>
          <button className='modal-close' onClick={onClose}>✕</button>
        </div>

        <form className='create-post-form' onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor='post-title'>Title</label>
            <input
              id='post-title'
              type='text'
              className='post-title-input'
              placeholder='Enter a descriptive title...'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              autoFocus
            />
            <span className='char-count'>{title.length} / 200</span>
          </div>

          <div className='form-group'>
            <label htmlFor='post-content'>Content</label>
            <textarea
              id='post-content'
              className='post-content-textarea'
              placeholder='Share your thoughts, strategies, or questions...'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              maxLength={10000}
            />
            <span className='char-count'>{content.length} / 10,000</span>
          </div>

          {error && (
            <div className='error-message'>
              {error}
            </div>
          )}

          <div className='modal-footer'>
            <button
              type='button'
              className='cancel-btn'
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='submit-btn'
              disabled={!title.trim() || !content.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;