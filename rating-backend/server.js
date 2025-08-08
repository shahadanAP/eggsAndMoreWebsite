const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/restaurant-ratings')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Rating Schema
const ratingSchema = new mongoose.Schema({
  dishName: String,
  rating: { type: Number, min: 1, max: 5 },
  feedback: String,
  userIdentifier: String, // Stores unique identifier for each user
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Rating = mongoose.model('Rating', ratingSchema);

// Submit or update rating
app.post('/api/ratings', async (req, res) => {
  try {
    const { dishName, rating, feedback, userIdentifier } = req.body;
    
    if (!userIdentifier) {
      return res.status(400).json({ error: 'User identifier is required' });
    }

    // Check for existing rating by this user
    const existingRating = await Rating.findOne({ dishName, userIdentifier });
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.feedback = feedback;
      existingRating.updatedAt = new Date();
      await existingRating.save();
    } else {
      // Create new rating
      const newRating = new Rating({ 
        dishName, 
        rating, 
        feedback, 
        userIdentifier 
      });
      await newRating.save();
    }
    
    // Calculate new average
    const ratings = await Rating.find({ dishName });
    const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    res.json({ 
      success: true, 
      average,
      message: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get average rating
app.get('/api/ratings/:dishName', async (req, res) => {
  try {
    const dishName = decodeURIComponent(req.params.dishName);
    const ratings = await Rating.find({ dishName });
    
    if (ratings.length === 0) {
      return res.json({ average: null, count: 0 });
    }
    
    const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    res.json({ 
      average,
      count: ratings.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check for existing rating by user
app.get('/api/ratings/:dishName/:userIdentifier', async (req, res) => {
  try {
    const dishName = decodeURIComponent(req.params.dishName);
    const userIdentifier = req.params.userIdentifier;
    
    const existingRating = await Rating.findOne({ dishName, userIdentifier });
    
    res.json({ 
      exists: !!existingRating,
      rating: existingRating 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all ratings for a dish (optional - for admin purposes)
app.get('/api/ratings-details/:dishName', async (req, res) => {
  try {
    const dishName = decodeURIComponent(req.params.dishName);
    const ratings = await Rating.find({ dishName }).sort({ updatedAt: -1 });
    
    res.json({ ratings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this endpoint to get all ratings
app.get('/api/ratings', async (req, res) => {
  try {
    console.log('Fetching all ratings...'); // Debug log
    const allRatings = await Rating.find({});
    console.log('Found ratings:', allRatings); // Debug log
    res.json(allRatings);
  } catch (error) {
    console.error('Error fetching ratings:', error); // Debug log
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));