const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const drawRoutes = require('./routes/drawRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB database
connectDB();

/**
 * Middleware Configuration
 */

// ✅ FINAL CORS FIX (production-ready)
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    // allow localhost
    if (origin.includes("localhost")) {
      return callback(null, true);
    }

    // allow ALL vercel domains
    if (origin.includes("vercel.app")) {
      return callback(null, true);
    }

    // block others
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// Parse JSON
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * API Routes
 */

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SaaS Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/users/register',
        login: 'POST /api/users/login',
        profile: 'GET /api/users/profile',
        updateProfile: 'PUT /api/users/profile'
      },
      scores: {
        addScore: 'POST /api/scores',
        getScores: 'GET /api/scores'
      },
      draw: {
        runDraw: 'POST /api/draw/run'
      }
    }
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/draw', drawRoutes);

/**
 * Error Handling
 */
app.use(notFound);
app.use(errorHandler);

/**
 * Server Config
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Server is running on port ${PORT}
📝 Environment: ${process.env.NODE_ENV || 'development'}
🌐 CORS enabled for: localhost + all vercel domains
📊 MongoDB URI: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Not configured'}
🎲 Draw API: /api/draw/run
  `);
});

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;