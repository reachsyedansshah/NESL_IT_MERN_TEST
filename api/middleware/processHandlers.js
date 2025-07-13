/**
 * Process Error Handlers
 * 
 * Handles process-level errors and graceful shutdown
 */
const { logError, logWarn, logInfo } = require('../utils/logger');

/**
 * Setup process error handlers
 * @param {Object} server - Express server instance
 */
const setupProcessHandlers = (server) => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logError('Uncaught Exception occurred', err, {
      processId: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
    
    // Log the error and exit gracefully
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logError('Unhandled Promise Rejection', new Error(reason), {
      processId: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      promise: promise.toString(),
      timestamp: new Date().toISOString()
    });
    
    // Log the error but don't exit immediately
    // This allows the application to continue running
    // but logs the issue for debugging
  });

  // Handle graceful shutdown on SIGTERM
  process.on('SIGTERM', () => {
    logInfo('SIGTERM received, initiating graceful shutdown', {
      processId: process.pid,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
    
    server.close(() => {
      logInfo('Server closed successfully, process terminating', {
        processId: process.pid,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
      process.exit(0);
    });
  });

  // Handle graceful shutdown on SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    logInfo('SIGINT received, initiating graceful shutdown', {
      processId: process.pid,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
    
    server.close(() => {
      logInfo('Server closed successfully, process terminating', {
        processId: process.pid,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
      process.exit(0);
    });
  });

  // Handle process warnings
  process.on('warning', (warning) => {
    logWarn('Process warning detected', {
      processId: process.pid,
      warningName: warning.name,
      warningMessage: warning.message,
      warningStack: warning.stack,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Handle process exit
  process.on('exit', (code) => {
    logInfo('Process exiting', {
      processId: process.pid,
      exitCode: code,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Log server startup
  logInfo('Process handlers configured successfully', {
    processId: process.pid,
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  setupProcessHandlers
}; 