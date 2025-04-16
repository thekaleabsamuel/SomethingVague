const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/radio-station', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Handle radio stream updates
  socket.on('radio-status', (data) => {
    io.emit('radio-update', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Import routes
const radioRoutes = require('./routes/radio');
const blogRoutes = require('./routes/blog');
const userRoutes = require('./routes/users');
const trackRoutes = require('./routes/tracks');
const commentRoutes = require('./routes/comments');

// Use routes
app.use('/api/radio', radioRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api', commentRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.set('Access-Control-Allow-Credentials', 'true');
  }
}));
app.use('/uploads/profile-pictures', express.static(path.join(__dirname, '../uploads/profile-pictures'), {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.set('Access-Control-Allow-Credentials', 'true');
  }
}));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Radio Station API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start radio streaming
  const radioController = require('./controllers/radioController');
  radioController.startStreaming();
}); 