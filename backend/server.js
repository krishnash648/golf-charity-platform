const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const userRoutes = require('./routes/userRoutes');
const scoreRoutes = require('./routes/scoreRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB database
connectDB();

/**
 * Middleware Configuration
 * Setup essential middleware for the application
 */

// Enable CORS (Cross-Origin Resource Sharing)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * API Routes
 * Define all application routes
 */

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
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
      }
    }
  });
});

// User authentication routes
app.use('/api/users', userRoutes);

// Score routes
app.use('/api/scores', scoreRoutes);

/**
 * Error Handling Middleware
 * Must be defined after all routes
 */

// Handle 404 errors (routes that don't exist)
app.use(notFound);

// Handle all other errors
app.use(errorHandler);

/**
 * Server Configuration
 * Start the Express server
 */

// Get port from environment variables or use default
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Server is running on port ${PORT}
📝 Environment: ${process.env.NODE_ENV || 'development'}
🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
📊 MongoDB URI: ${process.env.MONGODB_URI ? '✅ Configured' : '❌ Not configured'}
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;