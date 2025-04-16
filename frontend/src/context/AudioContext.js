import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
    }

    // Set up audio event listeners
    audioRef.current.onloadedmetadata = () => {
      setDuration(audioRef.current.duration);
    };

    audioRef.current.ontimeupdate = () => {
      setProgress(audioRef.current.currentTime);
    };

    audioRef.current.onended = () => {
      handleNextTrack();
    };

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Fetch playlist
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5002/api/radio/tracks', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw new Error('Session expired. Please log in again.');
          }
          throw new Error(`Failed to fetch tracks: ${response.statusText}`);
        }

        const data = await response.json();
        setPlaylist(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchPlaylist();
  }, []);

  // Handle track changes
  useEffect(() => {
    if (playlist.length > 0 && currentTrackIndex >= 0) {
      const currentTrack = playlist[currentTrackIndex];
      if (!currentTrack) return;

      const loadTrack = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const audioUrl = getAbsolutePath(currentTrack.url);
          audioRef.current.src = audioUrl;

          if (isPlaying) {
            audioRef.current.play();
          }

          setIsLoading(false);
        } catch (err) {
          console.error('Error loading track:', err);
          setError('Error loading track');
          setIsLoading(false);
        }
      };

      loadTrack();
    }
  }, [currentTrackIndex, playlist]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  const handlePreviousTrack = () => {
    setCurrentTrackIndex((prevIndex) => 
      prevIndex === 0 ? playlist.length - 1 : prevIndex - 1
    );
  };

  const getAbsolutePath = (relativePath) => {
    return new URL(relativePath, window.location.origin).href;
  };

  const value = {
    playlist,
    currentTrackIndex,
    isPlaying,
    progress,
    duration,
    error,
    isLoading,
    currentTrack: playlist[currentTrackIndex],
    handlePlayPause,
    handleNextTrack,
    handlePreviousTrack,
    audioRef
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export default AudioContext; 