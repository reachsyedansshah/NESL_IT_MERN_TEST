require('dotenv').config();
const express = require('express');
const { cors, helmet, rateLimiter, xss} = require('./security');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { setupProcessHandlers } = require('./middleware/processHandlers');
const { morganMiddleware, logInfo, logError } = require('./utils/logger');

// Import routes
const routes = require('./routes');
const app = express();

// Security middleware
app.use(helmet);
app.use(cors);
app.use(xss);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('uploads'));

// HTTP request logging with Morgan
app.use(morganMiddleware);

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  logInfo('Health check requested', { 
    ip: req.ip, 
    userAgent: req.get('User-Agent') 
  });
  
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/v1', routes);

// 404 handler for undefined routes
app.use('*', notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT || 3030;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server only if not in test mode
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logInfo(`🚀 Server started successfully`, {
      port: PORT,
      environment: NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform
    });
  });

  // Setup process error handlers
  setupProcessHandlers(server);
}

module.exports = app; 