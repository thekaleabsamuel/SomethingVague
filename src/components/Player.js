import React, { useState, useRef, useEffect } from "react";
import playlistService from "../services/playlistService";

function Player() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef(null);

  // Load playlist from service
  useEffect(() => {
    const tracks = playlistService.getPlaylist();
    setPlaylist(tracks);
    setIsLoading(false);
  }, []);

  // Handle track loading and playback
  useEffect(() => {
    if (playlist.length === 0 || isLoading) return;

    const audio = audioRef.current;
    if (!audio) return;

    const trackUrl = process.env.PUBLIC_URL + playlist[currentTrackIndex].url.replace('public/', '');
    audio.src = trackUrl;
    audio.load();

    const attemptAutoplay = () => {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.log("Autoplay prevented, waiting for user interaction");
          setIsPlaying(false);
        });
    };

    const handleEnded = () => {
      // Automatically go to next track, loop to beginning if at end
      setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
    };

    audio.addEventListener('ended', handleEnded);
    attemptAutoplay();

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex, playlist, isLoading]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error("Playback error:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  // Add event listeners for audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error("Audio error:", e);
      // Skip to next track if current one fails
      setCurrentTrackIndex(prev => (prev + 1) % playlist.length);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [playlist.length]);

  if (isLoading || playlist.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: '#fff'
      }}>
        <p>Loading player...</p>
      </div>
    );
  }

  const currentTrackInfo = playlist[currentTrackIndex];
  const artworkUrl = process.env.PUBLIC_URL + currentTrackInfo.artwork.replace('public/', '');

  return (
    <div
      className="player-container"
      style={{
        backgroundImage: `url(${artworkUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
        transition: "background-image 1s ease-in-out"
      }}
    >
      <audio ref={audioRef} />
      
      <div className="track-info" style={{ 
        backgroundColor: "rgba(0,0,0,0.7)", 
        color: "white", 
        padding: "20px",
        borderRadius: "10px",
        textAlign: "center",
        width: "80%",
        maxWidth: "500px"
      }}>
        <h2>Live Now</h2>
        <h3>{currentTrackInfo.title}</h3>
        <p>{currentTrackInfo.artist}</p>
      </div>

      <div className="player-controls" style={{ 
        backgroundColor: "rgba(0,0,0,0.7)", 
        padding: "20px",
        borderRadius: "10px",
        marginBottom: "40px"
      }}>
        <button 
          onClick={togglePlay}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            cursor: "pointer",
            backgroundColor: isPlaying ? "#ff5555" : "#55ff55",
            color: "#000",
            border: "none",
            borderRadius: "50px",
            fontWeight: "bold",
            minWidth: "120px"
          }}
        >
          {isPlaying ? "PAUSE" : "PLAY"}
        </button>
      </div>
    </div>
  );
}

export default Player;