const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const movieRoutes = require('./src/routes/movieRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', movieRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Movie Search API is running',
        endpoints: {
            search: '/api/movies/search/:title'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎬 Movie Search API running on http://localhost:${PORT}`);
    console.log(`📍 Search endpoint: http://localhost:${PORT}/api/movies/search/:title`);
});
