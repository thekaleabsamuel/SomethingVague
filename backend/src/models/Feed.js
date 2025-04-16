const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    default: 'main'
  },
  description: {
    type: String,
    default: 'Main feed for the radio station'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Feed = mongoose.model('Feed', feedSchema);

module.exports = Feed; 