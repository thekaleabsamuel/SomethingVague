import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../../styles/auth.css';

function Profile({ user, updateUser }) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || '');
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
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        throw new Error('You must be logged in to update your profile');
      }

      const formData = new FormData();
      formData.append('displayName', displayName);
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await fetch('http://localhost:5001/api/users/profile', {
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
        updateUser(data.user);
      }

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(data.user));
      
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
      if (parsedUserData.role !== 'ADMIN') {
        throw new Error('Only administrators can upload tracks');
      }

      const formData = new FormData();
      formData.append('title', trackTitle);
      formData.append('artist', trackArtist);
      formData.append('genre', trackGenre);
      formData.append('track', trackFile);
      formData.append('artwork', artworkFile);

      const response = await fetch('http://localhost:5001/api/tracks/upload', {
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
      <div className="profile-section">
        <h2>Profile Settings</h2>
        
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        
        <form onSubmit={handleProfileSubmit}>
          <input 
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          
          <div className="upload-section">
            <h3>Profile Picture</h3>
            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              <p>Drag & drop a profile picture here, or click to select</p>
              {previewUrl && (
                <div className="artwork-preview">
                  <img src={previewUrl} alt="Profile preview" />
                </div>
              )}
            </div>
          </div>
          
          <button type="submit" disabled={isProfileSubmitting} className="save-button">
            {isProfileSubmitting ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {user.isAdmin && (
        <div className="admin-section">
          <h2>Upload New Track</h2>
          <form onSubmit={handleTrackSubmit}>
            <input 
              type="text"
              placeholder="Track Title"
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              required
            />
            
            <input 
              type="text"
              placeholder="Artist"
              value={trackArtist}
              onChange={(e) => setTrackArtist(e.target.value)}
              required
            />
            
            <input 
              type="text"
              placeholder="Genre"
              value={trackGenre}
              onChange={(e) => setTrackGenre(e.target.value)}
              required
            />
            
            <div className="upload-section">
              <h3>Upload Track</h3>
              <div {...getTrackRootProps()} className="dropzone">
                <input {...getTrackInputProps()} />
                <p>Drag & drop an audio file here, or click to select</p>
                {trackFile && <p>Selected: {trackFile.name}</p>}
              </div>
            </div>
            
            <div className="upload-section">
              <h3>Upload Artwork</h3>
              <div {...getArtworkRootProps()} className="dropzone">
                <input {...getArtworkInputProps()} />
                <p>Drag & drop an image file here, or click to select</p>
                {artworkPreview && (
                  <div className="artwork-preview">
                    <img src={artworkPreview} alt="Artwork preview" />
                  </div>
                )}
              </div>
            </div>
            
            <button type="submit" disabled={isTrackSubmitting} className="submit-button">
              {isTrackSubmitting ? 'Uploading...' : 'Submit Track'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;




