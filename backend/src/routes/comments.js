const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Feed = require('../models/Feed');
const { authenticate } = require('../middleware/auth');

// Get or create the main feed
const getMainFeed = async () => {
  let feed = await Feed.findOne({ name: 'main' });
  if (!feed) {
    feed = await Feed.create({ name: 'main' });
  }
  return feed;
};

// Get comments for the feed
router.get('/feed/comments', async (req, res) => {
  try {
    const feed = await getMainFeed();
    const comments = await Comment.find({ feed: feed._id })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
});

// Add a comment to the feed
router.post('/feed/comments', authenticate, async (req, res) => {
  try {
    const feed = await getMainFeed();
    const comment = new Comment({
      content: req.body.content,
      author: req.user._id,
      feed: feed._id
    });

    await comment.save();
    
    // Populate author info before sending response
    await comment.populate('author', 'username profilePicture');
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Error adding comment', error: error.message });
  }
});

module.exports = router; 