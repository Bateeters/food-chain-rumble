import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { createPost, clearCreateSuccess } from '../../store/slices/forumSlice';
import './CreatePostModal.css';

const CreatePostModal = ({ boardId, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.forum);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const result = await dispatch(createPost({
      boardId,
      postData: { title: title.trim(), content: content.trim() }
    }));

    if (result.type === 'forum/createPost/fulfilled') {
      dispatch(clearCreateSuccess());
      navigate(`/forum/posts/${result.payload.post._id}`);
    }
  };

  return (
    <Modal show onHide={onClose} centered size="lg" className="forum-modal">
      <Modal.Header closeButton>
        <Modal.Title>Create New Post</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger" className="forum-inline-alert">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter a descriptive title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              autoFocus
            />
            <Form.Text className="text-secondary">{title.length} / 200</Form.Text>
          </Form.Group>

          <Form.Group>
            <Form.Label>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={12}
              placeholder="Share your thoughts, strategies, or questions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
            />
            <Form.Text className="text-secondary">{content.length} / 10,000</Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={onClose} disabled={isLoading} className="px-3 py-2">Cancel</Button>
          <Button variant="primary" type="submit" disabled={!title.trim() || !content.trim() || isLoading} className="px-3 py-2">
            {isLoading ? 'Creating...' : 'Create Post'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreatePostModal;
