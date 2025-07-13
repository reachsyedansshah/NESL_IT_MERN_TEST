/**
 * Follows Routes
 * 
 * Handles follow/unfollow operations and follow-related queries
 */

const express = require('express');
const { 
  followUser, 
  unfollowUser, 
  getFollowers, 
  getFollowing, 
  checkFollowStatus, 
  getFollowStats 
} = require('../controllers/follows.controller');
const { validate } = require('../middleware/validator');
const { requireAuth } = require('../middleware/authorize');
const { followQuerySchema } = require('../validators/follow.validator');
const { userIdSchema } = require('../validators/user.validators');


const router = express.Router();

// All follow routes require authentication
router.use(requireAuth);

/**
 * POST /follows/:userId
 * Follow a user
 */
router.post('/:userId', validate(userIdSchema), followUser);

/**
 * DELETE /follows/:userId
 * Unfollow a user
 */
router.delete('/:userId', validate(userIdSchema), unfollowUser);

/**
 * GET /follows/followers/:userId
 * Get user's followers
 */
router.get('/followers/:userId', validate({ ...userIdSchema, ...followQuerySchema }), getFollowers);

/**
 * GET /follows/following/:userId
 * Get users that a user is following
 */
router.get('/following/:userId', validate({ ...userIdSchema, ...followQuerySchema }), getFollowing);

/**
 * GET /follows/check/:userId
 * Check if current user is following another user
 */
router.get('/check/:userId', validate(userIdSchema), checkFollowStatus);

/**
 * GET /follows/stats/:userId
 * Get follow statistics for a user
 */
router.get('/stats/:userId', validate(userIdSchema), getFollowStats);

module.exports = router; 