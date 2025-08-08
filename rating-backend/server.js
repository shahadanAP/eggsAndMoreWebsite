// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

/**
 * CORS
 * - Dev (NODE_ENV !== 'production'): allow all (easier testing)
 * - Prod (NODE_ENV === 'production'): allow only ALLOWED_ORIGINS (comma-separated)
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
      // allow server-to-server / curl (no Origin header)
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

app.use(express.json());

// Health check
app.get('/health', (req, res) => res.status(200).send('ok'));

/**
 * Database
 * - Use env in prod, fallback to local for dev
 */
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-ratings';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1);
  });

/**
 * Schema / Model
 * - timestamps auto-manage createdAt/updatedAt
 * - unique(index) to prevent duplicate rating per (dishName, userIdentifier)
 */
const ratingSchema = new mongoose.Schema(
  {
    dishName: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    feedback: { type: String, trim: true },
    userIdentifier: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

ratingSchema.index({ dishName: 1, userIdentifier: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

/**
 * Routes
 */

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

// Check if a user already rated a dish
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

// All ratings (admin)
app.get('/api/ratings', async (req, res) => {
  try {
    const allRatings = await Rating.find({});
    res.json(allRatings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
