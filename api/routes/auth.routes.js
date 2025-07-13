/**
 * Authentication Routes
 * 
 * Handles login, logout, and profile endpoints
 */

const express = require('express');
const { login, getProfile } = require('../controllers/auth.controller');
const { validate } = require('../middleware/validator');
const { loginSchema } = require('../validators/user.validators');
const { requireAuth } = require('../middleware/authorize');

const router = express.Router();

// Rate limiting for authentication endpoints

/**
 * POST /login
 * Login endpoint with rate limiting
 */
router.post('/login', validate(loginSchema), login);

/**
 * GET /profile
 * Get current user profile (requires authentication)
 */
router.get('/profile', requireAuth, getProfile);

module.exports = router; 