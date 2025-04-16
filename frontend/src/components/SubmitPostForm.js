// src/components/SubmitPostForm.js
import React, { useState, useCallback } from 'react';
import axios from 'axios'; // For API calls
import { useDropzone } from 'react-dropzone';
import '../styles/SubmitPostForm.css'; // Create this CSS file

// --- MOCK API FUNCTIONS ---
// ** REPLACE these with your actual API calls **
async function uploadFile(file) {
  console.log('Uploading file:', file.name);
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Create FormData to send the file
  const formData = new FormData();
  formData.append('file', file); // 'file' should match your backend's expected field name

  try {
    // ** REPLACE WITH YOUR ACTUAL UPLOAD ENDPOINT **
    // const response = await axios.post('/api/upload', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   }
    // });
    // return response.data; // Assuming backend returns { url: '...' } or { fileId: '...' }

    // --- Mock Response ---
    const mockUrl = `/uploads/mock-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    console.log('Mock upload success:', mockUrl);
    return { url: mockUrl, filename: file.name }; // Return URL and original filename
    // --- End Mock Response ---

  } catch (error) {
    console.error("File upload failed:", error);
    throw error; // Re-throw error to be caught in handleSubmit
  }
}

async function submitArtistContent(submissionData) {
   console.log('Submitting artist content:', submissionData);
   // Simulate API delay
   await new Promise(resolve => setTimeout(resolve, 1000));

   try {
     // ** REPLACE WITH YOUR ACTUAL SUBMISSION ENDPOINT **
     // const response = await axios.post('/api/submissions', submissionData);
     // return response.data;

     // --- Mock Response ---
      const mockResponse = { 
        ...submissionData, 
        id: Date.now(), 
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      console.log('Mock submission success:', mockResponse);
      return mockResponse;
     // --- End Mock Response ---

   } catch (error) {
      console.error("Submission failed:", error);
      throw error; // Re-throw error
   }
}

// --- END MOCK API FUNCTIONS ---

function SubmitPostForm() {
  const [submissionType, setSubmissionType] = useState('music'); // Default type
  const [artistName, setArtistName] = useState('');
  const [artistEmail, setArtistEmail] = useState('');
  const [trackTitle, setTrackTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]); // Store file objects for upload
  const [artworkFiles, setArtworkFiles] = useState([]); // Store artwork files separately
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Audio/Music dropzone
  const onDropAudio = useCallback(acceptedFiles => {
    console.log('Accepted audio files:', acceptedFiles);
    const validFiles = acceptedFiles.filter(file => 
      file.type.startsWith('audio/')
    );

    if(validFiles.length !== acceptedFiles.length){
      setError(`Invalid file type(s). Please upload audio files only.`);
    } else {
      setError(null);
      setFiles(validFiles);
    }
  }, []);

  // Artwork dropzone
  const onDropArtwork = useCallback(acceptedFiles => {
    console.log('Accepted artwork files:', acceptedFiles);
    const validFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );

    if(validFiles.length !== acceptedFiles.length){
      setError(`Invalid file type(s). Please upload image files only.`);
    } else {
      setError(null);
      setArtworkFiles(validFiles);
    }
  }, []);

  // Visual media dropzone (photos/videos)
  const onDropVisual = useCallback(acceptedFiles => {
    console.log('Accepted visual files:', acceptedFiles);
    const validFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if(validFiles.length !== acceptedFiles.length){
      setError(`Invalid file type(s). Please upload image or video files only.`);
    } else {
      setError(null);
      setFiles(validFiles);
    }
  }, []);

  // Configure dropzones based on submission type
  const audioDropzone = useDropzone({
    onDrop: onDropAudio,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg']
    },
    multiple: false
  });

  const artworkDropzone = useDropzone({
    onDrop: onDropArtwork,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false
  });

  const visualDropzone = useDropzone({
    onDrop: onDropVisual,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.ogg']
    },
    multiple: true
  });

  const handleTypeChange = (type) => {
    setSubmissionType(type);
    setFiles([]);
    setArtworkFiles([]);
    setError(null);
    setSuccessMessage('');
  };

  const removeFile = (fileArray, setFileArray, index) => {
    setFileArray(prev => prev.filter((_, i) => i !== index));
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');

    // Basic Validation
    if (!artistName) {
      setError('Please enter your name.');
      setIsSubmitting(false);
      return;
    }

    if (!artistEmail || !/\S+@\S+\.\S+/.test(artistEmail)) {
      setError('Please enter a valid email address.');
       setIsSubmitting(false);
       return;
    }

    if (submissionType === 'music') {
      if (files.length === 0) {
        setError('Please upload an audio file.');
        setIsSubmitting(false);
        return;
      }
      if (artworkFiles.length === 0) {
        setError('Please upload artwork for your audio.');
       setIsSubmitting(false);
       return;
     }
      if (!trackTitle) {
        setError('Please enter a track title.');
        setIsSubmitting(false);
        return;
     }
    } else if (submissionType === 'visual' && files.length === 0) {
      setError('Please upload at least one photo or video.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Upload files
      let uploadedFiles = [];
      let uploadedArtwork = null;
      
      // Upload main files (audio or visual)
      const fileUploadPromises = files.map(file => uploadFile(file));
      uploadedFiles = await Promise.all(fileUploadPromises);
      
      // Upload artwork if it's a music submission
      if (submissionType === 'music' && artworkFiles.length > 0) {
        uploadedArtwork = await uploadFile(artworkFiles[0]);
      }

      // Prepare submission data
      const submissionData = {
        type: submissionType,
        artistName,
        email: artistEmail,
        title: trackTitle || 'Untitled',
        description,
        files: uploadedFiles.map(f => ({
          url: f.url,
          filename: f.filename,
          type: files.find(file => file.name === f.filename)?.type || ''
        })),
        artwork: uploadedArtwork ? uploadedArtwork.url : null
      };

      // Submit to backend
      const submission = await submitArtistContent(submissionData);

      setSuccessMessage(`Thank you for your submission! We'll review it and get back to you at ${artistEmail} if it's approved.`);
      
      // Reset form
      setArtistName('');
      setArtistEmail('');
      setTrackTitle('');
      setDescription('');
      setFiles([]);
      setArtworkFiles([]);

    } catch (err) {
      console.error("Submission failed:", err);
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render file previews
  const renderFilePreviews = (fileArray, setFileArray) => {
    return fileArray.map((file, index) => (
     <div key={index} className="file-preview">
       {file.type.startsWith('image/') ? (
         <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
       ) : (
         <div className="file-preview-icon">
            <span>{file.type.startsWith('audio/') ? '🎵' : (file.type.startsWith('video/') ? '🎬' : '📄')}</span>
            <p>{file.name}</p>
         </div>
       )}
        <button 
          type="button" 
          onClick={() => removeFile(fileArray, setFileArray, index)} 
          className="remove-file-btn"
        >
          &times;
        </button>
     </div>
   ));
  };

  return (
    <div className="submit-form-container">
      <h2>Submit Your Work</h2>
      <p className="submission-intro">
        Share your creative work with our community. Selected submissions will be featured on our radio station.
      </p>

      {/* Submission Type Selection */}
      <div className="submission-type-selector">
        <button
          type="button"
          className={`type-btn ${submissionType === 'music' ? 'active' : ''}`}
          onClick={() => handleTypeChange('music')}
        >
          Music
        </button>
          <button
            type="button"
          className={`type-btn ${submissionType === 'visual' ? 'active' : ''}`}
          onClick={() => handleTypeChange('visual')}
          >
          Photo/Video
          </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Common Fields */}
        <div className="form-group">
          <label htmlFor="artistName">Your Name/Artist Name*</label>
          <input
            type="text"
            id="artistName"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            placeholder="Enter your name or artist name"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="artistEmail">Email*</label>
          <input
            type="email"
            id="artistEmail"
            value={artistEmail}
            onChange={(e) => setArtistEmail(e.target.value)}
            placeholder="Your email address"
            disabled={isSubmitting}
            required
          />
          <small>We'll send you a notification if your submission is approved.</small>
        </div>

        {/* Music-specific Fields */}
        {submissionType === 'music' && (
          <>
            <div className="form-group">
              <label htmlFor="trackTitle">Track Title*</label>
              <input
                type="text"
                id="trackTitle"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                placeholder="Title of your track"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="form-group">
              <label>Audio File*</label>
              <div {...audioDropzone.getRootProps()} className={`dropzone ${audioDropzone.isDragActive ? 'active' : ''}`}>
                <input {...audioDropzone.getInputProps()} />
                {audioDropzone.isDragActive ? (
                  <p>Drop the audio file here ...</p>
                ) : (
                  <p>Drag 'n' drop your audio file here, or click to select</p>
                )}
              </div>
              {files.length > 0 && (
                <aside className="file-previews-container">
                  <h4>Selected Audio:</h4>
                  {renderFilePreviews(files, setFiles)}
                </aside>
              )}
            </div>

          <div className="form-group">
              <label>Track Artwork*</label>
              <div {...artworkDropzone.getRootProps()} className={`dropzone ${artworkDropzone.isDragActive ? 'active' : ''}`}>
                <input {...artworkDropzone.getInputProps()} />
                {artworkDropzone.isDragActive ? (
                  <p>Drop the artwork here ...</p>
                ) : (
                  <p>Drag 'n' drop your track artwork here, or click to select</p>
                )}
              </div>
              {artworkFiles.length > 0 && (
                <aside className="file-previews-container">
                  <h4>Selected Artwork:</h4>
                  {renderFilePreviews(artworkFiles, setArtworkFiles)}
                </aside>
              )}
          </div>
          </>
        )}

        {/* Visual Media Fields */}
        {submissionType === 'visual' && (
          <div className="form-group">
            <label>Photos/Videos*</label>
            <div {...visualDropzone.getRootProps()} className={`dropzone ${visualDropzone.isDragActive ? 'active' : ''}`}>
              <input {...visualDropzone.getInputProps()} />
              {visualDropzone.isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                <p>Drag 'n' drop your photos/videos here, or click to select</p>
                )}
             </div>
              {files.length > 0 && (
                  <aside className="file-previews-container">
                     <h4>Selected Files:</h4>
                {renderFilePreviews(files, setFiles)}
                  </aside>
              )}
          </div>
        )}

        {/* Common Description Field */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us about your submission (optional)"
            disabled={isSubmitting}
            rows={4}
          />
        </div>

        {/* Submit Button & Messages */}
        <div className="form-actions">
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SubmitPostForm;