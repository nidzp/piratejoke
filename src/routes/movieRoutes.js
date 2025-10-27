const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

// GET /api/movies/search/:title - Search for a movie and return streaming sources
router.get('/movies/search/:title', movieController.searchMovie);

module.exports = router;
