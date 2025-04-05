import React, { useState, useRef, useEffect } from "react";
import { useLocation } from 'react-router-dom'; // Import useLocation
import playlistService from "../services/playlistService";
import CommentSection from "./CommentSection"; // Import the CommentSection
import '../styles/player.css'; // Keep this for the large player styles
import '../styles/bottomPlayerBar.css'; // Create and import this for the small player

// Waveform placeholder image - you would replace this with actual audio waveform visualization
const WAVEFORM_PLACEHOLDER = "https://i.imgur.com/EHzuWTo.png";

function Player({ user }) {
    const [playlist, setPlaylist] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlayerReady, setIsPlayerReady] = useState(false); // Track if initial load is done
    const [error, setError] = useState(null); // Track errors
    const [progress, setProgress] = useState(0); // Keep progress tracking for bottom player
    const [duration, setDuration] = useState(0); // Keep duration tracking
    const audioRef = useRef(null);
    const originalBodyStyleRef = useRef(null);
    const location = useLocation(); // Get the current location object

    // Determine if we are on the homepage
    const isHomePage = location.pathname === '/';

    // Helper to ensure correct path formatting
    const getCleanPath = (path) => {
        // Remove any public prefix if it exists
        if (path.startsWith('public/')) {
            path = path.replace('public/', '');
        }
        return path;
    };

    // --- Hooks ---
    useEffect(() => { /* Load Playlist */
        try {
            const tracks = playlistService.getPlaylist();
            if (tracks && tracks.length > 0) {
                // Clean up any path issues in the loaded tracks
                const cleanedTracks = tracks.map(track => ({
                    ...track,
                    url: getCleanPath(track.url),
                    artwork: getCleanPath(track.artwork)
                }));
                
                console.log("Loaded playlist:", cleanedTracks.length, "tracks", cleanedTracks);
                setPlaylist(cleanedTracks);
                setError(null);
            } else {
                console.error("No tracks returned from playlistService");
                setError("No tracks available");
            }
        } catch (err) {
            console.error("Error loading playlist:", err);
            setError("Failed to load playlist");
        }
    }, []);

    useEffect(() => { /* Global Background Effect */
        // Decide if this should ONLY run on the homepage
        if (!isHomePage || playlist.length === 0 || isLoading || currentTrackIndex < 0) {
            // Optional: Restore original body style if navigating away from home
             if (!isHomePage && originalBodyStyleRef.current) {
                 Object.assign(document.body.style, originalBodyStyleRef.current);
             }
            return; // Don't apply effect if not on home or not ready
        }

        const currentTrackInfo = playlist[currentTrackIndex];
        if (!currentTrackInfo || !currentTrackInfo.artwork) return; // Safety check

        // Use artwork path directly 
        const artworkUrl = currentTrackInfo.artwork;
        console.log("Setting background with artwork:", artworkUrl);

        // Store original styles if not already stored (only on homepage)
        if (originalBodyStyleRef.current === null) {
             originalBodyStyleRef.current = {
                backgroundImage: document.body.style.backgroundImage,
                backgroundSize: document.body.style.backgroundSize,
                backgroundPosition: document.body.style.backgroundPosition,
                backgroundAttachment: document.body.style.backgroundAttachment,
                minHeight: document.body.style.minHeight,
                // transition: document.body.style.transition // Be careful storing transition
            };
        }
        // Apply new styles
        document.body.style.backgroundImage = `url(${artworkUrl})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center center';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.minHeight = '100vh';
        document.body.style.transition = 'background-image 1s ease-in-out';

        // Cleanup: Restore styles when navigating away *or* component unmounts
        return () => {
             if (originalBodyStyleRef.current) {
                 Object.assign(document.body.style, originalBodyStyleRef.current);
                 // Optional: Reset ref if you want it re-captured if returning to home
                 // originalBodyStyleRef.current = null;
             }
         };
    // Add isHomePage to dependencies
    }, [currentTrackIndex, playlist, isLoading, isHomePage]);

    useEffect(() => { /* Track Loading/Playback */
        if (playlist.length === 0 || currentTrackIndex < 0) {
            setIsLoading(true); // Set loading if no playlist/index
            return;
        }

        const audio = audioRef.current; if (!audio) return;
        const track = playlist[currentTrackIndex];
        if (!track || !track.url) {
            console.error("Invalid track data:", track);
            setIsLoading(true);
            setError("Invalid track data");
            return; // Skip if track data is invalid
        }

        setIsLoading(true); // Set loading when changing track
        const trackUrl = track.url;
        console.log("Loading audio track:", trackUrl);
        
        setError(null); // Clear any previous errors
        setProgress(0); // Reset progress when changing tracks
        setDuration(0); // Reset duration

        // Set src only if it's different
        if (!audio.src.endsWith(trackUrl)) {
            audio.src = trackUrl;
            audio.load(); // Load the new source
        } else if (isPlaying && audio.paused) {
             // If src is the same but we intend to play, try playing
            audio.play().catch(e => {
                console.error("Retry play error:", e);
                setError("Failed to play track");
            });
        }

        const handleCanPlay = () => {
            console.log("Audio can play:", trackUrl);
            setIsLoading(false); // Ready to play this track
            setIsPlayerReady(true); // Mark that the player has loaded at least once
            setError(null); // Clear any errors since audio is playable
            setDuration(audio.duration || 0); // Set duration when known
             if (isPlaying) {
                 audio.play().catch(e => {
                     console.error("Autoplay error:", e);
                     setError("Autoplay failed - try clicking play");
                 });
             }
             // Clean up this specific listener once it fires
             audio.removeEventListener('canplay', handleCanPlay);
        };

        const handleEnded = () => {
            console.log("Track ended");
            setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
            // Playback will resume via the isPlaying state in the next canplay event
        };

        const handleTimeUpdate = () => {
            if (audio.duration) {
                setProgress(audio.currentTime / audio.duration * 100);
            }
        };

        const handleDurationChange = () => {
            setDuration(audio.duration || 0);
        };

        // Clear previous listeners before adding new ones for this track
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('durationchange', handleDurationChange);

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);

        return () => { // Cleanup listeners when track changes or component unmounts
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
        };
    // Add isPlaying dependency: if isPlaying changes to true, we want the effect to re-run and potentially call play()
    }, [currentTrackIndex, playlist, isPlaying]);


    useEffect(() => { /* Audio State Sync Events */
        const audio = audioRef.current; if (!audio) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleError = (e) => {
            console.error("Audio error:", e, "Current track:", playlist[currentTrackIndex]);
            setIsLoading(false); // Stop loading on error
            setIsPlaying(false);
            setError(`Error playing track: ${playlist[currentTrackIndex]?.title} - file may be missing at path: ${playlist[currentTrackIndex]?.url}`);
            // Maybe try next track?
            // setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
        };

        // Set initial state based on audio element (covers browser controls)
        setIsPlaying(!audio.paused);

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('error', handleError);

        return () => { // Cleanup on unmount
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('error', handleError);
        };
    }, [playlist.length, currentTrackIndex]); // Re-attach if playlist changes fundamentally

    // --- Control Functions ---
    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio || playlist.length === 0 || isLoading) return; // Don't toggle if loading or no playlist

        if (audio.paused) {
             // We set isPlaying to true, the effect hook will handle the actual audio.play()
            setIsPlaying(true);
            audio.play().catch(error => { 
                console.error("Playback error:", error); 
                setIsPlaying(false); 
                setError("Failed to play audio");
            }); // Also try direct play
        } else {
            audio.pause();
            setIsPlaying(false); // Immediately reflect pause intent
        }
    };

    const rewind15Seconds = () => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = Math.max(0, audio.currentTime - 15);
        }
    };

    // For next/prev track in bottom player
    const playNextTrack = () => {
        setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
    };

    const playPreviousTrack = () => {
        setCurrentTrackIndex(prev => 
            prev === 0 ? playlist.length - 1 : prev - 1
        );
    };

    // Format time function for displaying current time and duration
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // --- Render Logic ---

    // Always render the audio tag - THIS IS KEY FOR PERSISTENCE
    const audioTag = <audio ref={audioRef} preload="metadata" />;

    // Handle loading state and errors
    if (error && playlist.length === 0) {
        // Critical error - no playlist available
        return (
            <>
                {audioTag}
                <div className="player-error">
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Reload Page</button>
                </div>
            </>
        );
    }

    // Don't render full UI until the player has loaded something
    if (!isPlayerReady && isLoading) {
        return (
            <>
                {audioTag}
                <div className="initial-loading">Loading Radio...</div>
            </>
        );
    }

    // We have a playlist and player is ready, get current track info
    const currentTrackInfo = playlist[currentTrackIndex];
    if (!currentTrackInfo) {
        // Handle case where index might be invalid temporarily
        return (
            <>
                {audioTag}
                <div className="player-error">
                    <p>No track selected</p>
                </div>
            </>
        );
    }

    // All good, display the track info
    const artworkUrl = currentTrackInfo.artwork || 'artwork/default-artwork.png'; // Fallback
    const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
    const trackDuration = audioRef.current ? audioRef.current.duration : 0;

    // --- Conditional UI Rendering ---
    return (
        <>
            {audioTag} {/* Audio tag is always rendered */}

            {isHomePage ? (
                // --- SoundCloud-like Player UI on HomePage ---
                <div className="player-container">
                    <div className="player-header">
                        {isLoading && <div className="loading-overlay">Loading...</div>}
                        {error && <div className="error-overlay">{error}</div>}
                        
                        <div className="player-top-section">
                            <div className="player-left-section">
                                <button 
                                    onClick={togglePlay} 
                                    disabled={isLoading} 
                                    className="player-play-button" 
                                    aria-label={isPlaying ? "Pause" : "Play"}
                                >
                                    {isLoading ? '...' : (isPlaying ? '❙❙' : '▶')}
                                </button>
                            </div>
                            
                            <div className="player-info">
                                <h2 className="player-track-title">{currentTrackInfo.title}</h2>
                                {currentTrackInfo.artist && <p className="player-artist-name">{currentTrackInfo.artist}</p>}
                                
                                <div className="player-meta">
                                    <span className="player-time-ago">21 days ago</span>
                                    <span className="player-genre-tag"># Hip-hop & Rap</span>
                                </div>
                                
                                <div className="player-playlist-info">
                                    <span className="player-playlist-icon">🎵</span>
                                    <span>In playlist: New & Hot</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Centered artwork section */}
                        <div className="player-artwork-container">
                            <div 
                                className="player-artwork"
                                style={{ backgroundImage: `url(${artworkUrl})` }}
                            ></div>
                        </div>
                        
                        {/* Waveform visualization */}
                        <div className="player-waveform-container">
                            <div className="player-waveform">
                                <div 
                                    className="waveform-played" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                                <img 
                                    src={WAVEFORM_PLACEHOLDER} 
                                    alt="Audio waveform" 
                                    className="waveform-image" 
                                />
                            </div>
                        </div>
                        
                        <div className="player-controls">
                            <button onClick={rewind15Seconds} disabled={isLoading} aria-label="Rewind 15 seconds">
                                ↺15
                            </button>
                            <button onClick={playPreviousTrack} aria-label="Previous track">
                                ⏮
                            </button>
                            <button onClick={playNextTrack} aria-label="Next track">
                                ⏭
                            </button>
                            
                            <div className="player-time">
                                {formatTime(currentTime)} / {formatTime(trackDuration)}
                            </div>
                            
                            <div className="player-like-button">
                                ❤️ <span>I love this</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Comment section below the player */}
                    <div className="player-comment-section">
                        <div className="player-comment-header">
                            <h3 className="player-comment-title">Comments</h3>
                        </div>
                        <CommentSection user={user} currentTrack={currentTrackInfo} />
                    </div>
                </div>
            ) : (
                // --- Render Bottom Player Bar on Other Pages (keep improvements) ---
                <div className="bottom-player-bar">
                    {/* Progress bar at the top */}
                    <div 
                        className="bottom-player-progress" 
                        style={{ width: `${progress}%` }}
                    ></div>
                    
                    <div className="bottom-player-left">
                        <img src={artworkUrl} alt="" className="bottom-player-artwork" />
                        <div className="bottom-player-info">
                            <div className="bottom-player-title">{currentTrackInfo.title}</div>
                            {currentTrackInfo.artist && <div className="bottom-player-artist">{currentTrackInfo.artist}</div>}
                            {error && <div className="bottom-player-error">{error}</div>}
                        </div>
                    </div>
                    <div className="bottom-player-controls">
                        <button onClick={playPreviousTrack} className="bottom-player-prevnext" aria-label="Previous track">
                            ⏮
                        </button>
                        <button onClick={togglePlay} disabled={isLoading} className="bottom-player-playpause" aria-label={isPlaying ? "Pause" : "Play"}>
                            {isLoading ? '...' : (isPlaying ? '❙❙' : '▶')}
                        </button>
                        <button onClick={playNextTrack} className="bottom-player-prevnext" aria-label="Next track">
                            ⏭
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Player;