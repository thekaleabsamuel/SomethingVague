import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../../styles/auth.css';

function Profile({ user, updateUser }) {
  const [username, setUsername] = useState(user?.username || '');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    user?.profilePicture 
      ? user.profilePicture.startsWith('http') 
        ? user.profilePicture 
        : `http://localhost:5002${user.profilePicture}`
      : ''
  );
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isTrackSubmitting, setIsTrackSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Track upload states
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackGenre, setTrackGenre] = useState('');
  const [trackFile, setTrackFile] = useState(null);
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkPreview, setArtworkPreview] = useState('');

  // Handle profile image upload
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setProfilePicture(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  }, []);

  // Handle track file upload
  const onTrackDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file');
      return;
    }

    setTrackFile(file);
    setError('');
  }, []);

  // Handle artwork upload
  const onArtworkDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setArtworkFile(file);
    setArtworkPreview(URL.createObjectURL(file));
    setError('');
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });

  const { getRootProps: getTrackRootProps, getInputProps: getTrackInputProps } = useDropzone({
    onDrop: onTrackDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    maxFiles: 1
  });

  const { getRootProps: getArtworkRootProps, getInputProps: getArtworkInputProps } = useDropzone({
    onDrop: onArtworkDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsProfileSubmitting(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('You must be logged in to update your profile');
      }

      const formData = new FormData();
      formData.append('username', username);
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await fetch('http://localhost:5002/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token and user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Your session has expired. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      
      if (updateUser) {
        updateUser(data);
      }

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(data));
      
      setMessage('Profile updated successfully');
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setIsTrackSubmitting(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        throw new Error('You must be logged in to upload tracks');
      }

      // Parse user data to check admin status
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData.role !== 'admin') {
        throw new Error('Only administrators can upload tracks');
      }

      const formData = new FormData();
      formData.append('title', trackTitle);
      formData.append('artist', trackArtist);
      formData.append('genre', trackGenre);
      formData.append('track', trackFile);
      formData.append('artwork', artworkFile);

      const response = await fetch('http://localhost:5002/api/tracks/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Clear invalid token and user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Your session has expired. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload track');
      }

      const data = await response.json();
      
      setMessage('Track uploaded successfully!');
      // Reset form
      setTrackTitle('');
      setTrackArtist('');
      setTrackGenre('');
      setTrackFile(null);
      setArtworkFile(null);
      setArtworkPreview('');
    } catch (err) {
      console.error('Track upload error:', err);
      setError(err.message || 'Failed to upload track');
    } finally {
      setIsTrackSubmitting(false);
    }
  };

  if (!user) {
    return <p>Please log in to view your profile</p>;
  }

  return (
    <div className="profile-container">
      <h2>Profile Settings</h2>
      
      <form onSubmit={handleProfileSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Profile Picture</label>
          <div {...getRootProps()} className="dropzone">
            <input {...getInputProps()} />
            {previewUrl ? (
              <img src={previewUrl} alt="Profile preview" className="profile-preview" />
            ) : (
              <p>Drag & drop a profile picture, or click to select one</p>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <button type="submit" disabled={isProfileSubmitting}>
          {isProfileSubmitting ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      {user?.role === 'admin' && (
        <div className="track-upload-section">
          <h3>Upload New Track</h3>
          <form onSubmit={handleTrackSubmit} className="track-form">
            <div className="form-group">
              <label htmlFor="trackTitle">Track Title</label>
              <input
                type="text"
                id="trackTitle"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="trackArtist">Artist</label>
              <input
                type="text"
                id="trackArtist"
                value={trackArtist}
                onChange={(e) => setTrackArtist(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="trackGenre">Genre</label>
              <input
                type="text"
                id="trackGenre"
                value={trackGenre}
                onChange={(e) => setTrackGenre(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Track File</label>
              <div {...getTrackRootProps()} className="dropzone">
                <input {...getTrackInputProps()} />
                <p>Drag & drop a track file, or click to select one</p>
              </div>
            </div>

            <div className="form-group">
              <label>Track Artwork</label>
              <div {...getArtworkRootProps()} className="dropzone">
                <input {...getArtworkInputProps()} />
                {artworkPreview ? (
                  <img src={artworkPreview} alt="Artwork preview" className="artwork-preview" />
                ) : (
                  <p>Drag & drop artwork, or click to select one</p>
                )}
              </div>
            </div>

            <button type="submit" disabled={isTrackSubmitting}>
              {isTrackSubmitting ? 'Uploading...' : 'Upload Track'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;






