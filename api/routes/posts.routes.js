/**
 * Posts Routes
 * 
 * Handles post-related endpoints with role-based access control
 * Features:
 * - CRUD operations with proper validation
 * - Role-based permissions
 * - Pagination and filtering
 * - Comprehensive error handling
 */

const express = require('express');
const { 
  deletePost, 
  getAllPosts, 
  getPostById, 
  createPost,
  updatePost,
} = require('../controllers/posts.controller');
const { requireUserOrAdmin, requireAdmin } = require('../middleware/authorize');
const { validate } = require('../middleware/validator');
const { createPostSchema, updatePostSchema, postIdSchema } = require('../validators/post.validators');

const router = express.Router();

/**
 * GET /posts
 * Get all posts with pagination and filtering
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Posts per page (default: 10, max: 50)
 * - author: Filter by author ID
 * - sortBy: Sort by field (created)
 * - sortOrder: Sort order (asc, desc)
 */
router.get('/', getAllPosts);

/**
 * GET /posts/:id
 * Get a specific post by ID
 */
router.get('/:id', validate(postIdSchema), getPostById);

/**
 * POST /posts
 * Create a new post (requires authentication)
 * Body:
 * - content: Post content (required, max 1000 chars)
 */
router.post('/', requireUserOrAdmin, validate(createPostSchema), createPost);

/**
 * DELETE /posts/:id
 * Delete a post by ID (requires authentication)
 * Users can only delete their own posts, admins can delete any post
 */
router.delete('/:id', requireAdmin, validate(postIdSchema), deletePost);

module.exports = router; 