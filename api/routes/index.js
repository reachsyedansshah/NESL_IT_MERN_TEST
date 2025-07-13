const express = require('express');
const router = express.Router();
// const { validate, schemas } = require('../../middlewares/validator');

const authRoutes = require('./auth.routes');
const postRoutes = require('./posts.routes');
const followRoutes = require('./follows.routes');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Post routes
router.use('/posts', postRoutes);

// Follow routes
router.use('/follows', followRoutes);

module.exports = router;
