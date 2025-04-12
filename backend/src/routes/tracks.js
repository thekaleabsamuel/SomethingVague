const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth');
const Track = require('../models/Track');

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = ['uploads/tracks', 'uploads/artwork'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'track') {
      cb(null, 'uploads/tracks');
    } else if (file.fieldname === 'artwork') {
      cb(null, 'uploads/artwork');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Upload new track
router.post('/upload', 
  authenticate, 
  authorize(['admin']),
  upload.fields([
    { name: 'track', maxCount: 1 },
    { name: 'artwork', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, artist, genre } = req.body;
      
      if (!req.files.track || !req.files.artwork) {
        return res.status(400).json({ message: 'Both track and artwork files are required' });
      }

      const track = new Track({
        title,
        artist,
        genre,
        url: `/uploads/tracks/${req.files.track[0].filename}`,
        artwork: `/uploads/artwork/${req.files.artwork[0].filename}`,
        duration: 0, // You might want to calculate this from the audio file
        isActive: true
      });

      await track.save();

      res.status(201).json({
        message: 'Track uploaded successfully',
        track
      });
    } catch (error) {
      res.status(400).json({ message: 'Error uploading track', error: error.message });
    }
  }
);

// Get all tracks
router.get('/', async (req, res) => {
  try {
    const tracks = await Track.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tracks', error: error.message });
  }
});

// Update track
router.put('/:id', 
  authenticate, 
  authorize(['admin']),
  async (req, res) => {
    try {
      const { title, artist, genre, isActive } = req.body;
      const track = await Track.findByIdAndUpdate(
        req.params.id,
        { title, artist, genre, isActive },
        { new: true }
      );

      if (!track) {
        return res.status(404).json({ message: 'Track not found' });
      }

      res.json(track);
    } catch (error) {
      res.status(400).json({ message: 'Error updating track', error: error.message });
    }
  }
);

// Delete track
router.delete('/:id', 
  authenticate, 
  authorize(['admin']),
  async (req, res) => {
    try {
      const track = await Track.findByIdAndDelete(req.params.id);

      if (!track) {
        return res.status(404).json({ message: 'Track not found' });
      }

      res.json({ message: 'Track deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Error deleting track', error: error.message });
    }
  }
);

module.exports = router; 