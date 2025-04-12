import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../../styles/auth.css';

function AdminTrackManager() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [trackFile, setTrackFile] = useState(null);
  const [artworkFile, setArtworkFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('genre', genre);
      formData.append('track', trackFile);
      formData.append('artwork', artworkFile);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/tracks/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setMessage('Track uploaded successfully!');
      // Reset form
      setTitle('');
      setArtist('');
      setGenre('');
      setTrackFile(null);
      setArtworkFile(null);
      setPreviewUrl('');
    } catch (err) {
      setError('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="admin-track-manager">
      <h2>Upload New Track</h2>
      
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          placeholder="Track Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <input 
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
        />
        
        <input 
          type="text"
          placeholder="Genre"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
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
            {previewUrl && (
              <div className="artwork-preview">
                <img src={previewUrl} alt="Artwork preview" />
              </div>
            )}
          </div>
        </div>
        
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Track'}
        </button>
      </form>
    </div>
  );
}

export default AdminTrackManager; 