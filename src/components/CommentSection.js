import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/commentSection.css'; // Create this CSS file

function CommentSection({ user, currentTrack }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentsContainerRef = useRef(null);

  // Safely extract track ID
  const trackId = currentTrack?.id || 'unknown';

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, you would fetch comments for the current track
    // from your backend API
    if (!currentTrack) return; // Skip if no track data
    
    // Generate mock comments for this track
    const mockComments = [
      {
        id: 1,
        text: "This track is amazing!",
        timestamp: new Date(Date.now() - 120000).toISOString(),
        user: {
          id: 'user1',
          displayName: 'MusicLover',
          profilePicture: 'https://via.placeholder.com/40'
        }
      },
      {
        id: 2,
        text: "Great beat and production",
        timestamp: new Date(Date.now() - 60000).toISOString(),
        user: {
          id: 'user2',
          displayName: 'BeatMaker',
          profilePicture: 'https://via.placeholder.com/40'
        }
      },
      {
        id: 3,
        text: `I'd love to hear more from ${currentTrack.artist || 'this artist'}!`,
        timestamp: new Date().toISOString(),
        user: {
          id: 'user3',
          displayName: 'RadioFan',
          profilePicture: 'https://via.placeholder.com/40'
        }
      },
    ];

    setComments(mockComments);
  }, [trackId, currentTrack]); // Reload comments when track changes

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
      // In a real app, you would send the comment to your backend API
      // const response = await fetch('/api/comments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     trackId: currentTrack.id,
      //     text: newComment,
      //     userId: user.id
      //   })
      // });
      // const data = await response.json();
      
      // For demonstration, we'll create a mock comment
      const mockNewComment = {
        id: Date.now(),
        text: newComment,
        timestamp: new Date().toISOString(),
        user: {
          id: user.id || 'current-user',
          displayName: user.displayName || user.email || 'Anonymous',
          profilePicture: user.profilePicture || 'https://via.placeholder.com/40'
        }
      };
      
      setComments(prevComments => [...prevComments, mockNewComment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format timestamp to show how long ago the comment was posted
  const formatTimestamp = (timestamp) => {
    const commentDate = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now - commentDate) / 1000);
    
    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} min ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hr ago`;
    return `${Math.floor(diffSeconds / 86400)} day(s) ago`;
  };

  // If no track is available, show a placeholder message
  if (!currentTrack) {
    return (
      <div className="comment-section">
        <h3 className="comment-section-title">Live Chat</h3>
        <div className="comments-container">
          <p className="no-comments">Track information is loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">Live Chat</h3>
      
      <div className="comments-container" ref={commentsContainerRef}>
        {comments.length === 0 ? (
          <p className="no-comments">Be the first to comment on this track!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-avatar">
                <img src={comment.user.profilePicture} alt={comment.user.displayName} />
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.user.displayName}</span>
                  <span className="comment-time">{formatTimestamp(comment.timestamp)}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            </div>
          ))
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
