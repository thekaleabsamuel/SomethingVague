import React, { useState, useRef, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import CommentSection from "./CommentSection";
import WaveSurfer from "wavesurfer.js";
import playlistService from "../services/playlistService";
import '../styles/player.css';
import '../styles/bottomPlayerBar.css';

// Get absolute path to file
const getAbsolutePath = (relativePath) => {
    return new URL(relativePath, window.location.origin).href;
};

function Player({ user }) {
    const [playlist, setPlaylist] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    
    const audioRef = useRef(new Audio());
    const waveformRef = useRef(null);
    const originalBodyStyleRef = useRef(null);
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const [wavesurferInstance, setWavesurferInstance] = useState(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    // Load playlist
    useEffect(() => {
        try {
            const tracks = playlistService.getPlaylist();
            if (tracks && tracks.length > 0) {
                setPlaylist(tracks);
                setError(null);
            } else {
                setError("No tracks available");
            }
        } catch (err) {
            console.error("Error loading playlist:", err);
            setError("Failed to load playlist");
        }
    }, []);

    // Handle track changes
    useEffect(() => {
        if (playlist.length === 0 || currentTrackIndex < 0) return;

        const audio = audioRef.current;
        const track = playlist[currentTrackIndex];
        if (!track) return;

        setIsLoading(true);
        setError(null);
        setProgress(0);
        setDuration(0);

        const handleCanPlay = () => {
            setIsLoading(false);
            setIsPlayerReady(true);
            setDuration(audio.duration || 0);
            if (isPlaying) {
                audio.play().catch(e => {
                    console.error("Play error:", e);
                    setError("Failed to play track");
                });
            }
        };

        const handleTimeUpdate = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
            }
        };

        const handleEnded = () => {
            setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
        };

        audio.src = getAbsolutePath(track.url);
        audio.load();

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentTrackIndex, playlist, isPlaying]);

    // Initialize WaveSurfer
    useEffect(() => {
        if (isHomePage && waveformRef.current && playlist[currentTrackIndex]) {
            try {
                const wavesurfer = WaveSurfer.create({
                    container: waveformRef.current,
                    waveColor: '#4a4a4a',
                    progressColor: '#ff6b00',
                    cursorColor: '#ff6b00',
                    barWidth: 2,
                    barRadius: 3,
                    cursorWidth: 1,
                    height: 80,
                    barGap: 3,
                    responsive: true,
                    backend: 'WebAudio'
                });

                const audioUrl = getAbsolutePath(playlist[currentTrackIndex].url);
                wavesurfer.load(audioUrl);

                wavesurfer.on('ready', () => {
                    setIsPlayerReady(true);
                    if (isPlaying) {
                        wavesurfer.play();
                    }
                });

                setWavesurferInstance(wavesurfer);

                return () => {
                    if (wavesurfer) {
                        wavesurfer.destroy();
                    }
                };
            } catch (err) {
                console.error('Error initializing WaveSurfer:', err);
                setError('Failed to initialize waveform visualization');
            }
        }
    }, [isHomePage, currentTrackIndex, playlist, isPlaying]);

    // Sync WaveSurfer with audio element
    useEffect(() => {
        if (wavesurferInstance) {
            if (isPlaying) {
                wavesurferInstance.play();
            } else {
                wavesurferInstance.pause();
            }
        }
    }, [isPlaying, wavesurferInstance]);

    // Background effect
    useEffect(() => {
        if (!isHomePage || !playlist[currentTrackIndex] || isLoading) {
            if (!isHomePage && originalBodyStyleRef.current) {
                Object.assign(document.body.style, originalBodyStyleRef.current);
            }
            return;
        }

        if (!originalBodyStyleRef.current) {
            originalBodyStyleRef.current = {
                backgroundImage: document.body.style.backgroundImage,
                backgroundSize: document.body.style.backgroundSize,
                backgroundPosition: document.body.style.backgroundPosition,
                backgroundAttachment: document.body.style.backgroundAttachment,
                minHeight: document.body.style.minHeight,
            };
        }

        document.body.style.backgroundImage = `url(${playlist[currentTrackIndex].artwork})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center center';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.minHeight = '100vh';
        document.body.style.transition = 'background-image 1s ease-in-out';

        return () => {
            if (originalBodyStyleRef.current) {
                Object.assign(document.body.style, originalBodyStyleRef.current);
            }
        };
    }, [currentTrackIndex, playlist, isLoading, isHomePage]);

    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (audio.paused) {
            audio.play().then(() => setIsPlaying(true)).catch(e => {
                console.error("Play error:", e);
                setError("Failed to play track");
            });
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    };

    const handleNextTrack = () => {
        setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
    };

    const handlePreviousTrack = () => {
        setCurrentTrackIndex(prev => prev === 0 ? playlist.length - 1 : prev - 1);
    };

    // Format time helper
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (error && !playlist.length) {
        return (
            <div className="player-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Reload Page</button>
            </div>
        );
    }

    if (!isPlayerReady && isLoading) {
        return <div className="initial-loading">Loading Radio...</div>;
    }

    if (!playlist[currentTrackIndex]) {
        return <div className="player-error"><p>No track selected</p></div>;
    }

    const currentTrack = playlist[currentTrackIndex];
    const currentTime = audioRef.current ? audioRef.current.currentTime : 0;

    return (
        <>
            {isHomePage ? (
                <div className="player-container">
                    <div className="player-ui-container">
                        {isLoading && <div className="loading-overlay">Loading...</div>}
                        {error && <div className="error-overlay">{error}</div>}
                        
                        <div 
                            className="player-artwork"
                            style={{ backgroundImage: `url(${currentTrack.artwork})` }}
                        ></div>
                        
                        <div className="player-track-details">
                            <h2>{currentTrack.title}</h2>
                            {currentTrack.artist && <p>{currentTrack.artist}</p>}
                            
                            {currentTrack.scheduledTime && (
                                <p className="scheduled-time">
                                    Scheduled: {new Date(currentTrack.scheduledTime).toLocaleString()}
                                </p>
                            )}
                        </div>
                        
                        <div className="player-waveform-container">
                            <div ref={waveformRef} className="waveform"></div>
                        </div>
                        
                        <div className="player-controls-centered">
                            <div className="control-button-placeholder"></div>
                            <button onClick={handlePlayPause} disabled={isLoading} className="control-button play-pause-main">
                                {isLoading ? '...' : (isPlaying ? '❙❙' : '▶')}
                            </button>
                            <div className="control-button-placeholder"></div>
                        </div>
                        
                        <div className="player-time">
                            {formatTime(currentTime)} / Live Radio
                        </div>
                    </div>
                    
                    <div className="player-comment-section">
                        <div className="player-comment-header">
                            <h3 className="player-comment-title">Comments</h3>
                        </div>
                        <CommentSection user={user} currentTrack={currentTrack} />
                    </div>
                </div>
            ) : (
                <div className="bottom-player-bar">
                    <div 
                        className="bottom-player-progress" 
                        style={{ width: `${progress}%` }}
                    ></div>
                    
                    <div className="bottom-player-left">
                        <img src={currentTrack.artwork} alt="" className="bottom-player-artwork" />
                        <div className="bottom-player-info">
                            <div className="bottom-player-title">{currentTrack.title}</div>
                            {currentTrack.artist && <div className="bottom-player-artist">{currentTrack.artist}</div>}
                            {error && <div className="bottom-player-error">{error}</div>}
                        </div>
                    </div>
                    <div className="bottom-player-controls">
                        <button onClick={handlePreviousTrack} className="bottom-player-prevnext">
                            ⏮
                        </button>
                        <button onClick={handlePlayPause} disabled={isLoading} className="bottom-player-playpause">
                            {isLoading ? '...' : (isPlaying ? '❙❙' : '▶')}
                        </button>
                        <button onClick={handleNextTrack} className="bottom-player-prevnext">
                            ⏭
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Player;