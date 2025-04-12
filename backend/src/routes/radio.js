const express = require('express');
const router = express.Router();
const radioController = require('../controllers/radioController');
const { authenticate, authorize } = require('../middleware/auth');
const Track = require('../models/Track');

// Get current radio status
router.get('/status', (req, res) => {
  try {
    const status = radioController.getCurrentStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Error getting radio status', error: error.message });
  }
});

// Start radio streaming (admin only)
router.post('/start', authenticate, authorize(['admin', 'dj']), (req, res) => {
  try {
    radioController.startStreaming();
    res.json({ message: 'Radio streaming started' });
  } catch (error) {
    res.status(500).json({ message: 'Error starting radio stream', error: error.message });
  }
});

// Add new track (admin only)
router.post('/tracks', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const track = await radioController.addTrack(req.body);
    res.status(201).json(track);
  } catch (error) {
    res.status(400).json({ message: 'Error adding track', error: error.message });
  }
});

// Remove track (admin only)
router.delete('/tracks/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    await radioController.removeTrack(req.params.id);
    res.json({ message: 'Track removed successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error removing track', error: error.message });
  }
});

// Get all tracks
router.get('/tracks', async (req, res) => {
  try {
    const tracks = await Track.find({ isActive: true })
      .sort({ lastPlayed: -1 })
      .limit(50);
    res.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ message: 'Error fetching tracks', error: error.message });
  }
});

// Get track by ID
router.get('/tracks/:id', async (req, res) => {
  try {
    const track = await Track.findById(req.params.id);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    res.json(track);
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({ message: 'Error fetching track', error: error.message });
  }
});

module.exports = router; 