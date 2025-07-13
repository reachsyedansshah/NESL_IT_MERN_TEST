const winston = require('winston');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for different log levels
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Add colors to winston
winston.addColors(logColors);

// Create custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Create custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  transports: [
    // Error logs
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    }),
    
    // Combined logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    }),
    
    // HTTP request logs
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: fileFormat
    })
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat
    })
  ],
  // Handle unhandled rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Create Morgan middleware for HTTP request logging
const morganMiddleware = morgan(
  (tokens, req, res) => {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: tokens.status(req, res),
      responseTime: tokens['response-time'](req, res),
      contentLength: tokens.res(req, res, 'content-length'),
      userAgent: tokens['user-agent'](req, res),
      remoteAddr: tokens['remote-addr'](req, res),
      timestamp: new Date().toISOString()
    };

    // Log based on status code
    const status = parseInt(tokens.status(req, res));
    if (status >= 400) {
      logger.error('HTTP Request Error', logData);
    } else {
      logger.http('HTTP Request', logData);
    }

    return JSON.stringify(logData);
  },
  {
    stream: {
      write: (message) => {
        // Morgan will handle the logging through our custom format
      }
    }
  }
);

// Helper functions for different log levels
const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

const logError = (message, error = null, meta = {}) => {
  if (error) {
    meta.error = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }
  logger.error(message, meta);
};

const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

const logHttp = (message, meta = {}) => {
  logger.http(message, meta);
};

// Performance monitoring helper
const logPerformance = (operation, duration, meta = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  logger[level](`Performance: ${operation} took ${duration}ms`, {
    operation,
    duration,
    ...meta
  });
};

// Database operation logging
const logDatabase = (operation, collection, duration, meta = {}) => {
  logger.info(`Database ${operation}`, {
    operation,
    collection,
    duration,
    ...meta
  });
};

// Authentication logging
const logAuth = (action, userId, success, meta = {}) => {
  const level = success ? 'info' : 'warn';
  logger[level](`Authentication ${action}`, {
    action,
    userId,
    success,
    ...meta
  });
};

// API endpoint logging
const logApi = (method, endpoint, statusCode, duration, userId = null, meta = {}) => {
  const level = statusCode >= 400 ? 'warn' : 'info';
  logger[level](`API ${method} ${endpoint}`, {
    method,
    endpoint,
    statusCode,
    duration,
    userId,
    ...meta
  });
};

module.exports = {
  logger,
  morganMiddleware,
  logInfo,
  logError,
  logWarn,
  logDebug,
  logHttp,
  logPerformance,
  logDatabase,
  logAuth,
  logApi
}; 