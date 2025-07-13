/**
 * Delete Posts Tests
 * 
 * Tests for DELETE /posts/:id endpoint with focus on:
 * 1. Successful delete by admin
 * 2. Forbidden delete by normal user
 * 3. Missing/invalid token
 */

const request = require('supertest');
const app = require('../server');

describe('DELETE /posts/:id', () => {
  let adminToken;
  let userToken;
  let testPostId;

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

    // Create a test post for deletion tests
    const createResponse = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        content: 'Test post for deletion'
      });

    testPostId = createResponse.body.data.post.id;
  });

  describe('1. Successful delete by admin', () => {
    it('should allow admin to delete any post', async () => {
      // First, create a post to delete
      const createResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Post to be deleted by admin'
        });

      const postId = createResponse.body.data.post.id;

      // Delete the post as admin
      const deleteResponse = await request(app)
        .delete(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toBe('Post deleted successfully');
      expect(deleteResponse.body.data.deletedPost).toBeDefined();
      expect(deleteResponse.body.data.deletedPost.id).toBe(postId);
      expect(deleteResponse.body.data.deletedPost.author).toBe('u1'); // admin user ID
      expect(deleteResponse.body.data.deletedPost.content).toBe('Post to be deleted by admin');
      expect(deleteResponse.body.data.deletedPost.deletedAt).toBeDefined();
    });

    it('should allow admin to delete another user\'s post', async () => {
      // Create a post as user
      const createResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'User post to be deleted by admin'
        });

      const postId = createResponse.body.data.post.id;

      // Delete the post as admin
      const deleteResponse = await request(app)
        .delete(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.message).toBe('Post deleted successfully');
      expect(deleteResponse.body.data.deletedPost.author).toBe('u2'); // user ID
    });
  });

  describe('2. Forbidden delete by normal user', () => {
    it('should return 403 when user tries to delete any post', async () => {
      // Create a post as admin
      const createResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Admin post that user tries to delete'
        });

      const postId = createResponse.body.data.post.id;

      // Try to delete as user
      const deleteResponse = await request(app)
        .delete(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(deleteResponse.body.success).toBe(false);
      expect(deleteResponse.body.message).toContain('Access denied');
      expect(deleteResponse.body.code).toBe('INSUFFICIENT_PERMISSIONS');
      expect(deleteResponse.body.statusCode).toBe(403);
      expect(deleteResponse.body.requiredRoles).toEqual(['admin']);
      expect(deleteResponse.body.userRole).toBe('user');
    });

    it('should return 403 when user tries to delete their own post', async () => {
      // Create a post as user
      const createResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          content: 'User\'s own post that they try to delete'
        });

      const postId = createResponse.body.data.post.id;

      // Try to delete as user (should still be forbidden)
      const deleteResponse = await request(app)
        .delete(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(deleteResponse.body.success).toBe(false);
      expect(deleteResponse.body.code).toBe('INSUFFICIENT_PERMISSIONS');
      expect(deleteResponse.body.userRole).toBe('user');
    });
  });

  describe('3. Missing/invalid token', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app)
        .delete('/api/v1/posts/p1')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authorization header missing');
      expect(response.body.code).toBe('AUTH_HEADER_ERROR');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 when token format is invalid', async () => {
      const response = await request(app)
        .delete('/api/v1/posts/p1')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid authorization header format');
      expect(response.body.code).toBe('AUTH_HEADER_ERROR');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 when token is malformed', async () => {
      const response = await request(app)
        .delete('/api/v1/posts/p1')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
      expect(response.body.code).toBe('TOKEN_VERIFICATION_ERROR');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 when token is expired', async () => {
      // Create an expired token (this would require modifying the JWT config for testing)
      const response = await request(app)
        .delete('/api/v1/posts/p1')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUxIiwicm9sZSI6ImFkbWluIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsImlzcyI6InNvY2lhbC1uZXR3b3JrLWFwaSIsImF1ZCI6InNvY2lhbC1uZXR3b3JrLXVzZXJzIn0.invalid-signature')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_VERIFICATION_ERROR');
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('Additional edge cases', () => {
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

    it('should return 404 for already deleted post', async () => {
      // Create and delete a post
      const createResponse = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Post to be deleted twice'
        });

      const postId = createResponse.body.data.post.id;

      // Delete it once
      await request(app)
        .delete(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Try to delete it again
      const secondDeleteResponse = await request(app)
        .delete(`/api/v1/posts/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(secondDeleteResponse.body.success).toBe(false);
      expect(secondDeleteResponse.body.message).toBe('Post not found');
      expect(secondDeleteResponse.body.code).toBe('POST_NOT_FOUND');
    });
  });
}); 