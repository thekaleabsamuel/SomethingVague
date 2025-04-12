const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const { authenticate, authorize } = require('../middleware/auth');

// Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find({ status: 'published' })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog posts', error: error.message });
  }
});

// Get single blog post
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username profilePicture'
        }
      });

    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog post', error: error.message });
  }
});

// Create new blog post (admin only)
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const post = new BlogPost({
      ...req.body,
      author: req.user._id
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: 'Error creating blog post', error: error.message });
  }
});

// Update blog post (admin only)
router.put('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: 'Error updating blog post', error: error.message });
  }
});

// Delete blog post (admin only)
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting blog post', error: error.message });
  }
});

// Add comment to blog post
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const comment = new Comment({
      content: req.body.content,
      author: req.user._id,
      post: post._id
    });

    await comment.save();
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Error adding comment', error: error.message });
  }
});

module.exports = router; 