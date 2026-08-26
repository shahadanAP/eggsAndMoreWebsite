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

// Serve static files from React app (pointing to the build folder) if present
const buildDir = path.join(__dirname, '../build');
app.use((req, res, next) => {
  try {
    // Only mount static middleware if build exists to avoid ENOENT
    if (require('fs').existsSync(buildDir)) {
      express.static(buildDir)(req, res, next);
    } else {
      next();
    }
  } catch {
    next();
  }
});

// Health check
app.get('/health', (req, res) => res.status(200).send('ok'));
// Render default health check alias
app.get('/healthz', (req, res) => res.status(200).send('ok'));

/**
 * Database Connection
 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-ratings';
if (isProd && !process.env.MONGODB_URI) {
  console.warn('[WARN] MONGODB_URI is NOT set in production. Falling back to local MongoDB URI. Set MONGODB_URI in the service environment variables or link an environment group.');
}

// Sanitize URI for logs (hide password)
const redactMongoUri = (uri) => {
  try {
    const u = new URL(uri);
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return '[redacted]';
  }
};

// Recommended mongoose options for cloud connections
const mongooseOptions = {
  // 20s to find primary before failing an attempt
  serverSelectionTimeoutMS: 20000,
  // 45s idle socket timeout (keeps connections healthy)
  socketTimeoutMS: 45000,
  // modest pool size for small services
  maxPoolSize: 5,
};

let lastDbError = null;

const classifyAndHint = (err) => {
  const msg = err?.message || '';
  if (/ENOTFOUND|getaddrinfo/i.test(msg)) {
    console.error('Hint: DNS lookup failed. Verify your connection string host (cluster URL) and internet/DNS.');
  }
  if (/ReplicaSetNoPrimary/i.test(msg)) {
    console.error('Hint: Could not find a primary. If you recently changed IP allowlist in Atlas, wait ~1-2 minutes.');
  }
  if (/Authentication failed|auth/i.test(msg)) {
    console.error('Hint: Authentication failed. Check username/password in MONGODB_URI and URL-encode special characters.');
  }
  if (/not whitelisted|IP|access/i.test(msg)) {
    console.error('Hint: Ensure your Atlas Network Access includes 0.0.0.0/0 or Render IPs.');
  }
};

// Retry with exponential backoff so deploys are resilient to temporary Atlas lag
let mongoConnectAttempt = 0;
const connectWithRetry = async () => {
  mongoConnectAttempt += 1;
  try {
    console.log(`Connecting to MongoDB at ${redactMongoUri(MONGODB_URI)} (attempt ${mongoConnectAttempt})`);
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('Connected to MongoDB');
  } catch (err) {
    lastDbError = err?.message || String(err);
    console.error('Could not connect to MongoDB:', err?.message || err);
    classifyAndHint(err);
    const delay = Math.min(30000, 1000 * 2 ** Math.min(mongoConnectAttempt, 5));
    console.log(`Retrying MongoDB connection in ${Math.round(delay / 1000)}s...`);
    setTimeout(connectWithRetry, delay);
  }
};

connectWithRetry();

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

// Catch-all for unmatched API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Debug endpoint for connection status.
// In production this leaks the DB host, database name and raw driver errors, so it is
// only served when DEBUG_TOKEN is set and the caller presents it.
app.get('/debug/db-status', (req, res) => {
  if (isProd) {
    const expected = process.env.DEBUG_TOKEN;
    if (!expected || req.get('x-debug-token') !== expected) {
      return res.status(404).json({ error: 'Not found' });
    }
  }
  res.json({
    readyState: mongoose.connection.readyState, // 0 disconnected, 1 connected
    attempts: mongoConnectAttempt,
    lastError: lastDbError,
    host: mongoose.connection.host,
    name: mongoose.connection.name,
  });
});

// All other requests return the React app (for client-side routing) if available
app.use((req, res) => {
  const indexPath = path.join(buildDir, 'index.html');
  try {
    if (require('fs').existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  } catch {}
  // If no build exists, indicate API is running
  res.status(200).json({ status: 'ok', message: 'Backend running (no frontend build found)' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, '../build')}`);
});
