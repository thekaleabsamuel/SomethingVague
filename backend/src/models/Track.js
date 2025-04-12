const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  artwork: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  playCount: {
    type: Number,
    default: 0
  },
  lastPlayed: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
trackSchema.index({ title: 'text', artist: 'text', genre: 'text' });
trackSchema.index({ isActive: 1, createdAt: -1 });

const Track = mongoose.model('Track', trackSchema);

module.exports = Track; 