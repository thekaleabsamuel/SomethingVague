const mongoose = require('mongoose');
const User = require('../models/User');
const Track = require('../models/Track');
const BlogPost = require('../models/BlogPost');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/radio-station', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Clear existing data
    await User.deleteMany({});
    await Track.deleteMany({});
    await BlogPost.deleteMany({});

    // Create sample tracks
    const tracks = [
      {
        title: 'Summer Vibes',
        artist: 'DJ Cool',
        url: '/tracks/summer-vibes.mp3',
        artwork: '/artwork/summer-vibes.jpg',
        duration: 180,
        genre: 'House',
        isActive: true
      },
      {
        title: 'Night Drive',
        artist: 'Midnight Cruisers',
        url: '/tracks/night-drive.mp3',
        artwork: '/artwork/night-drive.jpg',
        duration: 240,
        genre: 'Synthwave',
        isActive: true
      },
      {
        title: 'Morning Coffee',
        artist: 'Chill Beats',
        url: '/tracks/morning-coffee.mp3',
        artwork: '/artwork/morning-coffee.jpg',
        duration: 210,
        genre: 'Lo-fi',
        isActive: true
      }
    ];

    await Track.insertMany(tracks);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 