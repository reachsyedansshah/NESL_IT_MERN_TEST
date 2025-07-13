/**
 * JWT Middleware
 * 
 * Handles JWT token generation, verification, and user authentication
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const users = require('../models/user.model');

// JWT Configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'secret-jwt-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  algorithm: 'HS256',
  issuer: 'social-network-api',
  audience: 'social-network-users'
};

/**
 * Generate JWT token for user
 * @param {Object} user - User object with id and role
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  try {    
    const payload = {
      id: user.id,
      role: user.role,
      name: user.name,
      iat: Math.floor(Date.now() / 1000),
      iss: JWT_CONFIG.issuer,
      aud: JWT_CONFIG.audience
    };
    
    const token = jwt.sign(payload, JWT_CONFIG.secret, {
      algorithm: JWT_CONFIG.algorithm,
      expiresIn: JWT_CONFIG.expiresIn
    });
    
    return token;
  } catch (error) {
    throw new Error('Failed to generate token');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    
    const decoded = jwt.verify(token, JWT_CONFIG.secret, {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string} Token string
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    throw new Error('Authorization header missing');
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization header format');
  }

  return parts[1];
};

/**
 * Get user by credentials (simulated authentication)
 * @param {string} email - email or user ID
 * @param {string} password - Password to verify
 * @returns {Object|null} User object or null if not found
 */
const authenticateUser = (email, password) => {
  // Find user by email
  const user = users.find(user => user.email === email);
  
  if (!user) {
    return null;
  }
  // Verify password using bcrypt
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  
  if (!isPasswordValid) {
    return null;
  }
  return user;
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  authenticateUser,
  JWT_CONFIG
}; 