/**
 * Global error handler middleware
 */
const { logError, logWarn, logInfo } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Default error response
  const errorResponse = {
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    statusCode: 500
  };

  // Prepare error metadata for logging
  const errorMeta = {
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id || null,
    timestamp: new Date().toISOString()
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    errorResponse.message = 'Validation error';
    errorResponse.code = 'VALIDATION_ERROR';
    errorResponse.statusCode = 400;
    errorResponse.errors = err.errors;
    
    logWarn('Validation error occurred', {
      ...errorMeta,
      validationErrors: err.errors
    });
    
    return res.status(400).json(errorResponse);
  }

  if (err.name === 'UnauthorizedError') {
    errorResponse.message = 'Unauthorized';
    errorResponse.code = 'UNAUTHORIZED';
    errorResponse.statusCode = 401;
    
    logWarn('Unauthorized access attempt', {
      ...errorMeta,
      reason: 'Invalid or missing authentication'
    });
    
    return res.status(401).json(errorResponse);
  }

  if (err.name === 'ForbiddenError') {
    errorResponse.message = 'Forbidden';
    errorResponse.code = 'FORBIDDEN';
    errorResponse.statusCode = 403;
    
    logWarn('Forbidden access attempt', {
      ...errorMeta,
      reason: 'Insufficient permissions'
    });
    
    return res.status(403).json(errorResponse);
  }

  if (err.name === 'NotFoundError') {
    errorResponse.message = 'Resource not found';
    errorResponse.code = 'NOT_FOUND';
    errorResponse.statusCode = 404;
    
    logInfo('Resource not found', {
      ...errorMeta,
      resource: req.originalUrl
    });
    
    return res.status(404).json(errorResponse);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse.message = 'Invalid token';
    errorResponse.code = 'TOKEN_VERIFICATION_ERROR';
    errorResponse.statusCode = 401;
    
    logWarn('JWT verification failed', {
      ...errorMeta,
      reason: 'Invalid token format or signature'
    });
    
    return res.status(401).json(errorResponse);
  }

  if (err.name === 'TokenExpiredError') {
    errorResponse.message = 'Token expired';
    errorResponse.code = 'TOKEN_EXPIRED';
    errorResponse.statusCode = 401;
    
    logWarn('JWT token expired', {
      ...errorMeta,
      reason: 'Token has exceeded its expiration time'
    });
    
    return res.status(401).json(errorResponse);
  }

  // Handle rate limiting errors
  if (err.status === 429) {
    errorResponse.message = 'Too many requests';
    errorResponse.code = 'RATE_LIMIT_EXCEEDED';
    errorResponse.statusCode = 429;
    
    logWarn('Rate limit exceeded', {
      ...errorMeta,
      reason: 'Too many requests from this IP'
    });
    
    return res.status(429).json(errorResponse);
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    errorResponse.message = 'Invalid JSON format';
    errorResponse.code = 'INVALID_JSON';
    errorResponse.statusCode = 400;
    
    logWarn('Invalid JSON received', {
      ...errorMeta,
      reason: 'Malformed JSON in request body'
    });
    
    return res.status(400).json(errorResponse);
  }

  // Handle database connection errors
  if (err.code === 'ECONNREFUSED') {
    errorResponse.message = 'Database connection failed';
    errorResponse.code = 'DATABASE_CONNECTION_ERROR';
    errorResponse.statusCode = 503;
    
    logError('Database connection failed', err, {
      ...errorMeta,
      reason: 'Unable to connect to database'
    });
    
    return res.status(503).json(errorResponse);
  }

  // Handle timeout errors
  if (err.code === 'ETIMEDOUT') {
    errorResponse.message = 'Request timeout';
    errorResponse.code = 'REQUEST_TIMEOUT';
    errorResponse.statusCode = 408;
    
    logWarn('Request timeout', {
      ...errorMeta,
      reason: 'Request exceeded time limit'
    });
    
    return res.status(408).json(errorResponse);
  }

  // In development, include stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err.message;
  }

  // Log the error for debugging
  logError('Unhandled error occurred', err, errorMeta);

  res.status(errorResponse.statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  logInfo('Route not found', {
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    statusCode: 404,
    method: req.method,
    path: req.originalUrl
  });
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    console.log(`[${logLevel}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger
}; 