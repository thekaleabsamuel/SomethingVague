const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Routes
app.get('/api/playlist', async (req, res) => {
    try {
        const tracks = await prisma.track.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(tracks);
    } catch (error) {
        console.error('Error fetching playlist:', error);
        res.status(500).json({ error: 'Failed to fetch playlist' });
    }
});

app.post('/api/tracks', upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'artwork', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, artist } = req.body;
        const audioFile = req.files['audio'][0];
        const artworkFile = req.files['artwork'][0];

        const track = await prisma.track.create({
            data: {
                title,
                artist,
                url: `/uploads/${audioFile.filename}`,
                artwork: `/uploads/${artworkFile.filename}`
            }
        });

        res.status(201).json(track);
    } catch (error) {
        console.error('Error uploading track:', error);
        res.status(500).json({ error: 'Failed to upload track' });
    }
});

app.delete('/api/tracks/:id', async (req, res) => {
    try {
        const track = await prisma.track.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        if (!track) {
            return res.status(404).json({ error: 'Track not found' });
        }

        // Delete files from uploads directory
        fs.unlinkSync(path.join(__dirname, track.url));
        fs.unlinkSync(path.join(__dirname, track.artwork));

        // Delete from database
        await prisma.track.delete({
            where: { id: parseInt(req.params.id) }
        });

        res.json({ message: 'Track deleted successfully' });
    } catch (error) {
        console.error('Error deleting track:', error);
        res.status(500).json({ error: 'Failed to delete track' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 