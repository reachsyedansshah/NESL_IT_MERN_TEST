/**
 * Authentication Controller
 * 
 * Handles user authentication and login functionality
 */

const { generateToken, authenticateUser } = require('../middleware/jwt');
const { logAuth, logError, logInfo, logPerformance } = require('../utils/logger');

/**
 * Login endpoint
 * POST /login
 */
const login = async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('=== LOGIN DEBUG ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Content-Type:', req.get('Content-Type'));
    
    const { email, password } = req.body;

    logInfo('Login attempt', {
      email: email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    // Authenticate user
    const user = authenticateUser(email, password);
    
    if (!user) {
      logAuth('login', email, false, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        reason: 'Invalid credentials'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401
      });
    }

    // Generate JWT token
    const token = generateToken(user);
    
    const duration = Date.now() - startTime;
    logPerformance('login', duration, {
      userId: user.id,
      email: user.email
    });
    
    logAuth('login', user.id, true, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      duration
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Login failed', error, {
      email: req.body.email,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      duration
    });
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      code: 'LOGIN_INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

/**
 * Get current user profile
 * GET /profile
 */
const getProfile = async (req, res) => {
  const startTime = Date.now();
  
  try {
    logInfo('Profile requested', {
      userId: req.user.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });

    const duration = Date.now() - startTime;
    logPerformance('getProfile', duration, {
      userId: req.user.id
    });

    return res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Get profile failed', error, {
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      duration
    });
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'PROFILE_INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

module.exports = {
  login,
  getProfile,
}; 