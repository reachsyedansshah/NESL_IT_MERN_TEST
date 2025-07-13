/**
 * Comprehensive Authentication Tests
 * 
 * Tests for all authentication endpoints with proper error handling
 */

const request = require('supertest');
const app = require('../server');

describe('Authentication Endpoints', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid admin credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe('u1');
      expect(response.body.data.user.role).toBe('admin');
      expect(response.body.data.user.name).toBe('John Doe');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.expiresIn).toBe('24h');
    });

    it('should login successfully with valid user credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'jane.doe@example.com',
          password: 'password'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('user');
      expect(response.body.data.user.name).toBe('Jane Doe');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'password'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john.doe@example.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for empty email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: '',
          password: 'password'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for empty password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: ''
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.statusCode).toBe(400);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
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

    it('should return admin profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe('u1');
      expect(response.body.data.user.role).toBe('admin');
      expect(response.body.data.user.name).toBe('John Doe');
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe('u2');
      expect(response.body.data.user.role).toBe('user');
      expect(response.body.data.user.name).toBe('Jane Doe');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authorization header missing');
      expect(response.body.code).toBe('AUTH_HEADER_ERROR');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for invalid token format', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'InvalidFormat token123')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid authorization header format');
      expect(response.body.code).toBe('AUTH_HEADER_ERROR');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for malformed token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
      expect(response.body.code).toBe('TOKEN_VERIFICATION_ERROR');
      expect(response.body.statusCode).toBe(401);
    });

    it('should return 401 for expired token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InUxIiwicm9sZSI6ImFkbWluIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjIsImlzcyI6InNvY2lhbC1uZXR3b3JrLWFwaSIsImF1ZCI6InNvY2lhbC1uZXR3b3JrLXVzZXJzIn0.invalid-signature')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('TOKEN_VERIFICATION_ERROR');
      expect(response.body.statusCode).toBe(401);
    });
  });
}); 