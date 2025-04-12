import React, { useState } from 'react';
import axios from 'axios';

function UploadTrack() {
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [audioFile, setAudioFile] = useState(null);
    const [artworkFile, setArtworkFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !artist || !audioFile || !artworkFile) {
            setError('Please fill in all fields and select both audio and artwork files');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('artist', artist);
        formData.append('audio', audioFile);
        formData.append('artwork', artworkFile);

        try {
            setUploading(true);
            setError(null);
            await axios.post('http://localhost:3001/api/tracks', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess(true);
            // Reset form
            setTitle('');
            setArtist('');
            setAudioFile(null);
            setArtworkFile(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload track');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-track">
            <h2>Upload New Track</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Track title"
                    />
                </div>
                <div className="form-group">
                    <label>Artist</label>
                    <input
                        type="text"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        placeholder="Artist name"
                    />
                </div>
                <div className="form-group">
                    <label>Audio File (MP3/WAV)</label>
                    <input
                        type="file"
                        accept="audio/mpeg,audio/wav"
                        onChange={(e) => setAudioFile(e.target.files[0])}
                    />
                </div>
                <div className="form-group">
                    <label>Artwork (JPG/PNG)</label>
                    <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => setArtworkFile(e.target.files[0])}
                    />
                </div>
                {error && <div className="error">{error}</div>}
                {success && <div className="success">Track uploaded successfully!</div>}
                <button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Track'}
                </button>
            </form>
        </div>
    );
}

export default UploadTrack; 