/**
 * Role-Based Access Control (RBAC) Middleware
 * 
 * This middleware verifies JWT tokens and checks user roles for authorization.
 * It follows the principle of least privilege and provides detailed error messages.
 */

const { verifyToken, extractTokenFromHeader } = require('./jwt');

/**
 * Custom middleware for role-based authorization
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    try {
      console.log('=== Authorization Middleware Debug ===');
      console.log('Request URL:', req.url);
      console.log('Request method:', req.method);
      console.log('Required roles:', roles);
      
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      console.log('Authorization header:', authHeader ? 'PRESENT' : 'MISSING');
      
      let token;

      try {
        token = extractTokenFromHeader(authHeader);
        console.log('Token extracted successfully');
      } catch (error) {
        console.error('Token extraction error:', error.message);
        return res.status(401).json({
          success: false,
          message: error.message,
          code: 'AUTH_HEADER_ERROR',
          statusCode: 401
        });
      }

      // Verify the token
      let decoded;
      try {
        decoded = verifyToken(token);
        console.log('Token verified successfully, user role:', decoded.role);
      } catch (error) {
        console.error('Token verification error:', error.message);
        return res.status(401).json({
          success: false,
          message: error.message,
          code: 'TOKEN_VERIFICATION_ERROR',
          statusCode: 401
        });
      }

      // Check if user has required role
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        console.log('Access denied - user role:', decoded.role, 'required roles:', roles);
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${decoded.role}`,
          code: 'INSUFFICIENT_PERMISSIONS',
          statusCode: 403,
          requiredRoles: roles,
          userRole: decoded.role
        });
      }

      console.log('Authorization successful for user:', decoded.id, 'role:', decoded.role);

      // Attach user information to request object
      req.user = {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name
      };

      // Add user info to response headers for debugging (optional)
      res.set('X-User-ID', decoded.id);
      res.set('X-User-Role', decoded.role);

      next();
    } catch (error) {
      console.error('Authorization middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization',
        code: 'AUTH_INTERNAL_ERROR',
        statusCode: 500
      });
    }
  };
};

/**
 * Middleware for admin-only access
 */
const requireAdmin = authorize(['admin']);

/**
 * Middleware for user or admin access
 */
const requireUserOrAdmin = authorize(['user', 'admin']);

/**
 * Middleware for any authenticated user
 */
const requireAuth = authorize(['user', 'admin']);

/**
 * Optional authentication middleware (doesn't block if no token)
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return next();
  }

  try {
    const token = extractTokenFromHeader(authHeader);
    const decoded = verifyToken(token);
    
    req.user = {
      id: decoded.id,
      role: decoded.role,
      name: decoded.name
    };
    
    next();
  } catch (error) {
    // Don't block the request, just continue without user info
    next();
  }
};

module.exports = {
  authorize,
  requireAdmin,
  requireUserOrAdmin,
  requireAuth,
  optionalAuth,
}; 