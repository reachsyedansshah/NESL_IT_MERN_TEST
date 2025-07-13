const { validationResult } = require('express-validator');
const posts = require('../models/post.model');

/**
 * Delete a post by ID
 * DELETE /posts/:id
 * 
 * Permissions:
 * - Users can only delete their own posts
 * - Admins can delete any post
 */
const deletePost = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        code: 'VALIDATION_ERROR',
        statusCode: 400
      });
    }

    const { id } = req.params;
    const { user } = req;

    // Find the post
    const postIndex = posts.findIndex(post => post.id === id && !post.isDeleted);
    
    if (postIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        code: 'POST_NOT_FOUND',
        statusCode: 404
      });
    }

    const post = posts[postIndex];

    // Check if user can delete this post
    // Users can only delete their own posts, admins can delete any post
    if (user.role !== 'admin' && post.author !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
        code: 'DELETE_PERMISSION_DENIED',
        statusCode: 403,
        postAuthor: post.author,
        userRole: user.role,
        requiredRole: 'admin or post owner'
      });
    }

    // Soft delete the post (mark as deleted instead of removing)
    posts[postIndex].isDeleted = true;
    posts[postIndex].updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: {
        deletedPost: {
          id: post.id,
          author: post.author,
          content: post.content,
          created: post.created,
          deletedAt: posts[postIndex].updatedAt
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during post deletion',
      code: 'DELETE_POST_INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

/**
 * Get all posts with pagination and filtering
 * GET /posts
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Posts per page (default: 10, max: 50)
 * - author: Filter by author ID
 */
const getAllPosts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      author,   
      sortBy = 'created',
      sortOrder = 'desc'
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // Max 50 posts per page
    const skip = (pageNum - 1) * limitNum;

    if (pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters',
        code: 'INVALID_PAGINATION',
        statusCode: 400
      });
    }

    // Filter posts
    let filteredPosts = posts.filter(post => !post.isDeleted);

    // Apply filters
    if (author) {
      filteredPosts = filteredPosts.filter(post => post.author === author);
    }

    // Sort posts
    const sortMultiplier = sortOrder === 'desc' ? -1 : 1;
    filteredPosts.sort((a, b) => (new Date(a.created) - new Date(b.created)) * sortMultiplier);

    // Apply pagination
    const totalPosts = filteredPosts.length;
    const totalPages = Math.ceil(totalPosts / limitNum);
    const paginatedPosts = filteredPosts.slice(skip, skip + limitNum);

    return res.status(200).json({
      success: true,
      data: {
        posts: paginatedPosts.map(post => ({
          id: post.id,
          author: post.author,
          content: post.content,
          created: post.created,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPosts,
          postsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'GET_POSTS_INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

/**
 * Get a specific post by ID
 * GET /posts/:id
 */
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = posts.find(post => post.id === id && !post.isDeleted);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
        code: 'POST_NOT_FOUND',
        statusCode: 404
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        post: {
          id: post.id,
          author: post.author,
          content: post.content,
          created: post.created,
          updatedAt: post.updatedAt,
          isDeleted: post.isDeleted
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      code: 'GET_POST_INTERNAL_ERROR',
      statusCode: 500
      
    });
  }
};

/**
 * Create a new post
 * POST /posts
 * 
 * Requires authentication
 */
const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const { user } = req;

    const newPost = {
      id: `p${Date.now()}`,
      author: user.id,
      content: content.trim(),
      created: new Date(),
      isDeleted: false,
      updatedAt: new Date()
    };

    posts.push(newPost);

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post: {
          id: newPost.id,
          author: newPost.author,
          content: newPost.content,
          created: newPost.created,
        }
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during post creation',
      code: 'CREATE_POST_INTERNAL_ERROR',
      statusCode: 500
    });
  }
};

module.exports = {
  deletePost,
  getAllPosts,
  getPostById,
  createPost
}; 