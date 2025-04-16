const commentRoutes = require('./routes/comments');

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api', commentRoutes); 