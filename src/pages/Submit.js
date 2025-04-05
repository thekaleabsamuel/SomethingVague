// src/pages/Submit.js
import React from 'react';
import SubmitPostForm from '../components/SubmitPostForm';
import '../styles/submit.css'; // Create this CSS file

function Submit() {
  return (
    <div className="submit-page">
      <div className="submit-header">
        <h1>Submit Your Music</h1>
        <p className="submit-intro">
          Share your tracks with our community! Selected submissions will be played on our online radio station.
          We'll notify you by email if your work is selected and when it will be featured on the station.
        </p>
      </div>
      
      <SubmitPostForm />
      
      <div className="submission-guidelines">
        <h3>Submission Guidelines</h3>
        <ul>
          <li>We accept music in MP3, WAV, or OGG formats</li>
          <li>Make sure your track has high-quality audio (at least 192kbps)</li>
          <li>Include artwork for your track (recommended size: 1400x1400px)</li>
          <li>We also accept photography and video art submissions</li>
          <li>You'll be notified by email if your submission is approved</li>
        </ul>
      </div>
    </div>
  );
}

export default Submit;