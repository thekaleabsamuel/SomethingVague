import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/commentSection.css'; // Create this CSS file

function CommentSection({ user }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsContainerRef = useRef(null);

  // Fetch comments for the feed
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch('http://localhost:5002/api/feed/comments');
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        console.log('Fetched comments:', data);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, []);

  // Auto-scroll to bottom when new comments are added
  useEffect(() => {
    if (commentsContainerRef.current) {
      const container = commentsContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [comments.length]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to comment');
      }

      const response = await fetch('http://localhost:5002/api/feed/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token and user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Your session has expired. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post comment');
      }

      const data = await response.json();
      console.log('New comment response:', data);
      
      setComments(prevComments => [...prevComments, data]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format timestamp to show how long ago the comment was posted
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'just now';
    
    const commentDate = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hr ago`;
    return `${Math.floor(diffSeconds / 86400)} day(s) ago`;
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">Live Chat</h3>
      
      <div className="comments-container" ref={commentsContainerRef}>
        {comments.length === 0 ? (
          <p className="no-comments">Be the first to comment!</p>
        ) : (
          comments.map(comment => {
            // Safely access comment data with defaults
            const content = comment?.content || '';
            const createdAt = comment?.createdAt || new Date().toISOString();
            const author = comment?.author || {};
            const profilePicture = author?.profilePicture 
              ? author.profilePicture.startsWith('http') 
                ? author.profilePicture 
                : `http://localhost:5002${author.profilePicture}`
              : 'https://via.placeholder.com/40';
            const username = author?.username || 'Anonymous';
            
            return (
              <div key={comment._id || Date.now()} className="comment">
                <div className="comment-avatar">
                  <img 
                    src={profilePicture} 
                    alt={username} 
                  />
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <span className="comment-author">{username}</span>
                    <span className="comment-time">{formatTimestamp(createdAt)}</span>
                  </div>
                  <p className="comment-text">{content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {user ? (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? '...' : 'Send'}
          </button>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <Link to="/login">Log in</Link> to join the conversation
        </div>
      )}
    </div>
  );
}

export default CommentSection;






