/**
 * Comprehensive Posts Tests
 * 
 * Tests for all posts endpoints with proper validation and error handling
 */

const request = require('supertest');
const app = require('../server');

describe('Posts Endpoints', () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    // Get tokens for testing
    const adminResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password'
      });

    const userResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'jane.doe@example.com',
        password: 'password'
      });

    adminToken = adminResponse.body.data.token;
    userToken = userResponse.body.data.token;
  });

  describe('GET /api/v1/posts', () => {
    it('should return all posts with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/posts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts).toBeDefined();
      expect(Array.isArray(response.body.data.posts)).toBe(true);
      expect(response.body.data.posts.length).toBeGreaterThan(0);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalPosts).toBeGreaterThan(0);
    });

    it('should return posts with custom pagination', async () => {
      const response = await request(app)
        .get('/api/v1/posts?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.postsPerPage).toBe(5);
      expect(response.body.data.posts.length).toBeLessThanOrEqual(5);
    });

    it('should filter posts by author', async () => {
      const response = await request(app)
        .get('/api/v1/posts?author=u2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.posts.every(post => post.author === 'u2')).toBe(true);
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const response = await request(app)
        .get('/api/v1/posts?page=0&limit=0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_PAGINATION');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for negative page number', async () => {
      const response = await request(app)
        .get('/api/v1/posts?page=-1')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_PAGINATION');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/posts/:id', () => {
    it('should return a specific post', async () => {
      const response = await request(app)
        .get('/api/v1/posts/p1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post).toBeDefined();
      expect(response.body.data.post.id).toBe('p1');
      expect(response.body.data.post.author).toBeDefined();
      expect(response.body.data.post.content).toBeDefined();
      expect(response.body.data.post.created).toBeDefined();
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .get('/api/v1/posts/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Post not found');
      expect(response.body.code).toBe('POST_NOT_FOUND');
      expect(response.body.statusCode).toBe(404);
    });

    it('should return 400 for invalid post ID format', async () => {
      const response = await request(app)
        .get('/api/v1/posts/invalid@id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/posts', () => {
    it('should create a new post with valid token (user)', async () => {
      const response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'This is a test post from user'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Post created successfully');
      expect(response.body.data.post).toBeDefined();
      expect(response.body.data.post.author).toBe('u2'); // user ID
      expect(response.body.data.post.content).toBe('This is a test post from user');
      expect(response.body.data.post.created).toBeDefined();
    });

    it('should create a new post with valid token (admin)', async () => {
      const response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'This is a test post from admin'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.post.author).toBe('u1'); // admin ID
      expect(response.body.data.post.content).toBe('This is a test post from admin');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/v1/posts')
        .send({
          content: 'This should fail'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('AUTH_HEADER_ERROR');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 400 for empty content', async () => {
      const response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: ''
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for missing content', async () => {
      const response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for content too long', async () => {
      const longContent = 'a'.repeat(1001);
      const response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: longContent
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', 'Bearer invalid.token.here')
        .send({
          content: 'This should fail'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_VERIFICATION_ERROR');
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/v1/posts/:id', () => {
    let testPostId;

    beforeEach(async () => {
      // Create a test post for deletion
      const createResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Test post for deletion'
        });

      testPostId = createResponse.body.data.post.id;
    });

    it('should allow admin to delete any post', async () => {
      const response = await request(app)
        .delete(`/api/v1/posts/${testPostId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Post deleted successfully');
      expect(response.body.data.deletedPost).toBeDefined();
      expect(response.body.data.deletedPost.id).toBe(testPostId);
      expect(response.body.data.deletedPost.deletedAt).toBeDefined();
    });

    it('should return 403 when user tries to delete post', async () => {
      const response = await request(app)
        .delete(`/api/v1/posts/${testPostId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
      expect(response.body.code).toBe('INSUFFICIENT_PERMISSIONS');
      expect(response.body.statusCode).toBe(403);
      expect(response.body.requiredRoles).toEqual(['admin']);
      expect(response.body.userRole).toBe('user');
    });

    it('should return 401 when no token provided', async () => {
      const response = await request(app)
        .delete(`/api/v1/posts/${testPostId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authorization header missing');
      expect(response.body.code).toBe('AUTH_HEADER_ERROR');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .delete(`/api/v1/posts/${testPostId}`)
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
      expect(response.body.code).toBe('TOKEN_VERIFICATION_ERROR');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .delete('/api/v1/posts/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Post not found');
      expect(response.body.code).toBe('POST_NOT_FOUND');
      expect(response.body.statusCode).toBe(404);
    });

    it('should return 400 for invalid post ID format', async () => {
      const response = await request(app)
        .delete('/api/v1/posts/invalid@id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.statusCode).toBe(400);
    });
  });
}); 