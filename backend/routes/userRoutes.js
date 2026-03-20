const express = require('express');
const { authenticate } = require('../middleware/auth');
const { register, login, getProfile, updateProfile } = require('../controllers/userController');

const router = express.Router();

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Get profile (protected)
router.get('/profile', authenticate, getProfile);

// Update profile (protected)
router.put('/profile', authenticate, updateProfile);

module.exports = router;