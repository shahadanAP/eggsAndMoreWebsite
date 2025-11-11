const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

/**
 * CORS Configuration
 */
const isProd = process.env.NODE_ENV === 'production';
if (isProd) {
  const FRONTEND_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  console.log('CORS (prod) allowed origins:', FRONTEND_ORIGINS);

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (FRONTEND_ORIGINS.includes(origin)) return cb(null, true);
      console.error('Blocked by CORS. Origin:', origin);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));
} else {
  console.log('CORS (dev) allowing all origins');
  app.use(cors({ origin: true, credentials: true }));
}

// Middleware
app.use(express.json());

// Serve static files from React app (pointing to the build folder)
app.use(express.static(path.join(__dirname, '../build')));

// Health check
app.get('/health', (req, res) => res.status(200).send('ok'));

/**
 * Database Connection
 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-ratings';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

/**
 * Rating Schema and Model
 */
const ratingSchema = new mongoose.Schema({
  dishName: { type: String, required: true, trim: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String, trim: true },
  userIdentifier: { type: String, required: true, trim: true }
}, { timestamps: true });

ratingSchema.index({ dishName: 1, userIdentifier: 1 }, { unique: true });
const Rating = mongoose.model('Rating', ratingSchema);

/**
 * Routes
 */

// All ratings (admin) - MUST come before parameterized routes
app.get('/api/ratings', async (req, res) => {
  try {
    const allRatings = await Rating.find({});
    res.json(allRatings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update rating
app.post('/api/ratings', async (req, res) => {
  try {
    const { dishName, rating, feedback, userIdentifier } = req.body;
    if (!dishName || !rating || !userIdentifier) {
      return res
        .status(400)
        .json({ error: 'dishName, rating, and userIdentifier are required' });
    }

    const update = { rating, feedback };
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };

    await Rating.findOneAndUpdate({ dishName, userIdentifier }, update, opts);

    // compute average & count via aggregation (faster)
    const stats = await Rating.aggregate([
      { $match: { dishName } },
      { $group: { _id: '$dishName', average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const average = stats[0]?.average ?? null;

    res.json({ success: true, average, message: 'Rating saved' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Duplicate rating for this user/dish' });
    }
    res.status(500).json({ error: error.message });
  }
});

// All ratings for a dish (admin)
app.get('/api/ratings-details/:dishName', async (req, res) => {
  try {
    const dishName = decodeURIComponent(req.params.dishName);
    const ratings = await Rating.find({ dishName }).sort({ updatedAt: -1 });
    res.json({ ratings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if a user already rated a dish - MUST come before single param route
app.get('/api/ratings/:dishName/:userIdentifier', async (req, res) => {
  try {
    const dishName = decodeURIComponent(req.params.dishName);
    const { userIdentifier } = req.params;
    const existingRating = await Rating.findOne({ dishName, userIdentifier });
    res.json({ exists: !!existingRating, rating: existingRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get average rating & count for a dish
app.get('/api/ratings/:dishName', async (req, res) => {
  try {
    const dishName = decodeURIComponent(req.params.dishName);
    const stats = await Rating.aggregate([
      { $match: { dishName } },
      { $group: { _id: '$dishName', average: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json({ average: stats[0]?.average ?? null, count: stats[0]?.count ?? 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// All other requests return the React app (for client-side routing)
app.get('*', (req, res) => {
  // If it's an API request that wasn't matched, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  // Otherwise serve the React app
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, '../build')}`);
});
