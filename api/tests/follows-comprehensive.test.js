/**
 * Comprehensive Follows Tests
 * 
 * Tests for all follows endpoints with proper validation and error handling
 */

const request = require('supertest');
const app = require('../server');

describe('Follows Endpoints', () => {
  let adminToken;
  let userToken;
  let user3Token;

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

    const user3Response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'jim.doe@example.com',
        password: 'password'
      });

    adminToken = adminResponse.body.data.token;
    userToken = userResponse.body.data.token;
    user3Token = user3Response.body.data.token;
  });

  describe('POST /api/v1/follows/:userId', () => {
    it('should allow user to follow another user', async () => {
      const response = await request(app)
        .post('/api/v1/follows/u3')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Successfully followed Jim Doe');
      expect(response.body.data.follow).toBeDefined();
      expect(response.body.data.follow.follower).toBe('u2'); // user ID
      expect(response.body.data.follow.following).toBe('u3');
      expect(response.body.data.follow.created).toBeDefined();
    });

    it('should return 400 when user tries to follow themselves', async () => {
      const response = await request(app)
        .post('/api/v1/follows/u2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You cannot follow yourself');
      expect(response.body.code).toBe('SELF_FOLLOW_ERROR');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 when already following', async () => {
      // Try to follow - this might succeed or fail depending on current state
      const firstResponse = await request(app)
        .post('/api/v1/follows/u3')
        .set('Authorization', `Bearer ${userToken}`);

      // If first request succeeded, try again. If it failed with 400, that's what we want
      if (firstResponse.status === 201) {
        // Try to follow again
        const response = await request(app)
          .post('/api/v1/follows/u3')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe('You are already following this user');
        expect(response.body.code).toBe('ALREADY_FOLLOWING');
        expect(response.body.statusCode).toBe(400);
      } else if (firstResponse.status === 400) {
        // Already following, which is what we want to test
        expect(firstResponse.body.success).toBe(false);
        expect(firstResponse.body.message).toBe('You are already following this user');
        expect(firstResponse.body.code).toBe('ALREADY_FOLLOWING');
        expect(firstResponse.body.statusCode).toBe(400);
      }
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/follows/nonexistent')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
      expect(response.body.code).toBe('USER_NOT_FOUND');
      expect(response.body.statusCode).toBe(404);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/v1/follows/u3')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('AUTH_HEADER_ERROR');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/follows/u3')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_VERIFICATION_ERROR');
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/v1/follows/:userId', () => {
    beforeEach(async () => {
      // Ensure user is following u3
      try {
        await request(app)
          .post('/api/v1/follows/u3')
          .set('Authorization', `Bearer ${userToken}`);
      } catch (error) {
        // Already following, continue
      }
    });

    it('should allow user to unfollow another user', async () => {
      const response = await request(app)
        .delete('/api/v1/follows/u3')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Successfully unfollowed Jim Doe');
      expect(response.body.data.unfollowed).toBeDefined();
      expect(response.body.data.unfollowed.follower).toBe('u2');
      expect(response.body.data.unfollowed.following).toBe('u3');
    });

    it('should return 400 when user tries to unfollow themselves', async () => {
      const response = await request(app)
        .delete('/api/v1/follows/u2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You cannot unfollow yourself');
      expect(response.body.code).toBe('SELF_UNFOLLOW_ERROR');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 when not following', async () => {
      const response = await request(app)
        .delete('/api/v1/follows/u4')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You are not following this user');
      expect(response.body.code).toBe('NOT_FOLLOWING');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/v1/follows/nonexistent')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
      expect(response.body.code).toBe('USER_NOT_FOUND');
      expect(response.body.statusCode).toBe(404);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .delete('/api/v1/follows/u3')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('AUTH_HEADER_ERROR');
      expect(response.body.statusCode).toBe(401);
    });
  });

  describe('GET /api/v1/follows/followers/:userId', () => {
    beforeEach(async () => {
      // Setup: user3 follows user2
      try {
        await request(app)
          .post('/api/v1/follows/u2')
          .set('Authorization', `Bearer ${user3Token}`);
      } catch (error) {
        // Already following, continue
      }
    });

    it('should return user\'s followers', async () => {
      const response = await request(app)
        .get('/api/v1/follows/followers/u2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.followers).toBeDefined();
      expect(Array.isArray(response.body.data.followers)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should return paginated followers', async () => {
      const response = await request(app)
        .get('/api/v1/follows/followers/u2?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/follows/followers/nonexistent')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
      expect(response.body.code).toBe('USER_NOT_FOUND');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/follows/following/:userId', () => {
    beforeEach(async () => {
      // Setup: user2 follows user3
      try {
        await request(app)
          .post('/api/v1/follows/u3')
          .set('Authorization', `Bearer ${userToken}`);
      } catch (error) {
        // Already following, continue
      }
    });

    it('should return user\'s following', async () => {
      const response = await request(app)
        .get('/api/v1/follows/following/u2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.following).toBeDefined();
      expect(Array.isArray(response.body.data.following)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should return paginated following', async () => {
      const response = await request(app)
        .get('/api/v1/follows/following/u2?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/follows/following/nonexistent')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
      expect(response.body.code).toBe('USER_NOT_FOUND');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/follows/check/:userId', () => {
    beforeEach(async () => {
      // Setup: user2 follows user3
      try {
        await request(app)
          .post('/api/v1/follows/u3')
          .set('Authorization', `Bearer ${userToken}`);
      } catch (error) {
        // Already following, continue
      }
    });

    it('should return true when following', async () => {
      const response = await request(app)
        .get('/api/v1/follows/check/u3')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isFollowing).toBe(true);
      expect(response.body.data.targetUser).toBeDefined();
    });

    it('should return false when not following', async () => {
      const response = await request(app)
        .get('/api/v1/follows/check/u4')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.isFollowing).toBe(false);
      expect(response.body.data.followId).toBeUndefined();
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/follows/check/u3')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('AUTH_HEADER_ERROR');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/follows/check/nonexistent')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
      expect(response.body.code).toBe('USER_NOT_FOUND');
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/follows/stats/:userId', () => {
    it('should return follow statistics', async () => {
      const response = await request(app)
        .get('/api/v1/follows/stats/u2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.followersCount).toBeDefined();
      expect(response.body.data.followingCount).toBeDefined();
      expect(typeof response.body.data.followersCount).toBe('number');
      expect(typeof response.body.data.followingCount).toBe('number');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/follows/stats/nonexistent')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
      expect(response.body.code).toBe('USER_NOT_FOUND');
      expect(response.body.statusCode).toBe(404);
    });
  });
}); 