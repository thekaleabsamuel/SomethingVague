const Track = require('../models/Track');
const { io } = require('../server');

class RadioController {
  constructor() {
    this.currentTrack = null;
    this.nextTrack = null;
    this.playlist = [];
    this.isPlaying = false;
    this.startTime = null;
    this.initializePlaylist();
  }

  async initializePlaylist() {
    try {
      // Get all active tracks
      const tracks = await Track.find({ isActive: true });
      this.playlist = this.shuffleArray([...tracks]);
      this.prepareNextTrack();
    } catch (error) {
      console.error('Error initializing playlist:', error);
    }
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  prepareNextTrack() {
    if (this.playlist.length === 0) {
      this.initializePlaylist();
      return;
    }

    this.nextTrack = this.playlist.shift();
    this.playlist.push(this.nextTrack); // Add it back to the end of the playlist
  }

  async startStreaming() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startTime = Date.now();
    
    if (!this.currentTrack) {
      this.currentTrack = this.nextTrack;
      this.prepareNextTrack();
    }

    this.broadcastStatus();
    this.scheduleNextTrack();
  }

  scheduleNextTrack() {
    if (!this.currentTrack) return;

    const duration = this.currentTrack.duration * 1000; // Convert to milliseconds
    const elapsed = Date.now() - this.startTime;
    const remaining = duration - elapsed;

    setTimeout(() => {
      this.switchToNextTrack();
    }, remaining);
  }

  async switchToNextTrack() {
    // Update play count and last played time for current track
    if (this.currentTrack) {
      await Track.findByIdAndUpdate(this.currentTrack._id, {
        $inc: { playCount: 1 },
        lastPlayed: new Date()
      });
    }

    this.currentTrack = this.nextTrack;
    this.prepareNextTrack();
    this.startTime = Date.now();

    this.broadcastStatus();
    this.scheduleNextTrack();
  }

  broadcastStatus() {
    if (!io) return;

    const status = {
      currentTrack: this.currentTrack,
      nextTrack: this.nextTrack,
      isPlaying: this.isPlaying,
      elapsedTime: this.startTime ? Date.now() - this.startTime : 0
    };

    io.emit('radio-update', status);
  }

  getCurrentStatus() {
    return {
      currentTrack: this.currentTrack,
      nextTrack: this.nextTrack,
      isPlaying: this.isPlaying,
      elapsedTime: this.startTime ? Date.now() - this.startTime : 0
    };
  }

  async addTrack(trackData) {
    try {
      const track = new Track(trackData);
      await track.save();
      this.playlist.push(track);
      return track;
    } catch (error) {
      throw error;
    }
  }

  async removeTrack(trackId) {
    try {
      await Track.findByIdAndUpdate(trackId, { isActive: false });
      this.playlist = this.playlist.filter(track => track._id.toString() !== trackId);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new RadioController(); 