import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../../styles/auth.css';

function Profile({ user, updateUser }) {
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock file upload
      let profilePictureUrl = user?.profilePicture;
      
      if (profilePicture) {
        // This would be your actual upload logic
        // const formData = new FormData();
        // formData.append('file', profilePicture);
        // const response = await fetch('/api/upload', { method: 'POST', body: formData });
        // const data = await response.json();
        // profilePictureUrl = data.url;
        
        // Mock URL for now
        profilePictureUrl = URL.createObjectURL(profilePicture);
      }

      // Update user profile
      const updatedUser = {
        ...user,
        displayName: displayName || user?.displayName,
        profilePicture: profilePictureUrl
      };

      if (updateUser) {
        updateUser(updatedUser);
      }

      setMessage('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <p>Please log in to view your profile</p>;
  }

  return (
    <div className="profile-container">
      <h2>Your Profile</h2>
      
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="profile-picture-section">
          <div className="current-profile-picture">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" />
            ) : (
              <div className="no-profile-picture">No Image</div>
            )}
          </div>
          
          <div {...getRootProps()} className="profile-picture-dropzone">
            <input {...getInputProps()} />
            <p>Drag & drop a profile picture or click to select one</p>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How you want to appear in comments"
            disabled={isSubmitting}
          />
        </div>
        
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="profile-update-button"
        >
          {isSubmitting ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}

export default Profile;
