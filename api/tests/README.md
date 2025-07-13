# API Test Suite

Comprehensive test suite for the Social Network API with focus on authentication, authorization, and error handling.

## 🧪 Test Files

### Core Test Files
- **`delete-posts.test.js`** - Focused tests for the three main scenarios:
  1. ✅ Successful delete by admin
  2. ❌ Forbidden delete by normal user  
  3. 🔐 Missing/invalid token
- **`auth-comprehensive.test.js`** - Complete authentication tests
- **`posts-comprehensive.test.js`** - All posts endpoint tests
- **`follows-comprehensive.test.js`** - All follows endpoint tests

### Legacy Test Files
- **`auth.test.js`** - Original auth tests (may need updates)
- **`posts.test.js`** - Original posts tests (may need updates)

## 🚀 Running Tests

### Run All Tests
```bash
npm run test:all
```

### Run Specific Test Suites
```bash
# Delete posts tests (your main focus)
npm run test:delete

# Authentication tests
npm run test:auth

# Posts tests
npm run test:posts

# Follows tests
npm run test:follows

# All tests with coverage
npm run test:coverage
```

### Run Individual Test Files
```bash
# Run specific test file
npx jest tests/delete-posts.test.js --verbose

# Run with watch mode
npx jest tests/delete-posts.test.js --watch

# Run with coverage
npx jest tests/delete-posts.test.js --coverage
```

## 🎯 Key Test Scenarios

### 1. Successful Delete by Admin
```javascript
it('should allow admin to delete any post', async () => {
  // Admin can delete any post (their own or others')
  const response = await request(app)
    .delete(`/api/v1/posts/${postId}`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);
  
  expect(response.body.success).toBe(true);
  expect(response.body.message).toBe('Post deleted successfully');
});
```

### 2. Forbidden Delete by Normal User
```javascript
it('should return 403 when user tries to delete any post', async () => {
  // Users cannot delete any posts (even their own)
  const response = await request(app)
    .delete(`/api/v1/posts/${postId}`)
    .set('Authorization', `Bearer ${userToken}`)
    .expect(403);
  
  expect(response.body.code).toBe('INSUFFICIENT_PERMISSIONS');
  expect(response.body.requiredRoles).toEqual(['admin']);
  expect(response.body.userRole).toBe('user');
});
```

### 3. Missing/Invalid Token
```javascript
it('should return 401 when no token is provided', async () => {
  const response = await request(app)
    .delete('/api/v1/posts/p1')
    .expect(401);
  
  expect(response.body.code).toBe('AUTH_HEADER_ERROR');
});

it('should return 401 when token is malformed', async () => {
  const response = await request(app)
    .delete('/api/v1/posts/p1')
    .set('Authorization', 'Bearer invalid.token.here')
    .expect(401);
  
  expect(response.body.code).toBe('TOKEN_VERIFICATION_ERROR');
});
```

## 📊 Test Coverage

### Authentication Tests
- ✅ Login with valid credentials (admin/user)
- ✅ Login with invalid credentials
- ✅ Missing/empty fields validation
- ✅ Profile access with valid token
- ✅ Profile access with invalid/missing token

### Posts Tests
- ✅ Get all posts with pagination
- ✅ Get specific post
- ✅ Create post with authentication
- ✅ Delete post (admin only)
- ✅ Validation errors
- ✅ Authorization errors

### Follows Tests
- ✅ Follow/unfollow users
- ✅ Get followers/following lists
- ✅ Check follow status
- ✅ Get follow statistics
- ✅ Self-follow prevention
- ✅ Duplicate follow prevention

### Error Handling Tests
- ✅ 400 Bad Request (validation errors)
- ✅ 401 Unauthorized (missing/invalid token)
- ✅ 403 Forbidden (insufficient permissions)
- ✅ 404 Not Found (resource not found)
- ✅ 500 Internal Server Error

## 🔧 Test Setup

### Prerequisites
- Node.js >= 18.0.0
- Jest testing framework
- Supertest for HTTP assertions

### Test Data
Tests use predefined users:
- **Admin**: `john.doe@example.com` / `password`
- **User**: `jane.doe@example.com` / `password`
- **User3**: `jim.doe@example.com` / `password`

### Test Environment
- Uses in-memory data (no database required)
- Each test creates fresh data
- Tokens are generated for each test suite

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure port 3000 is available
2. **Token issues**: Check JWT configuration
3. **Test data**: Ensure user models are properly loaded

### Debug Mode
```bash
# Run with detailed logging
DEBUG=* npm run test:delete

# Run single test
npx jest tests/delete-posts.test.js --verbose --detectOpenHandles
```

### Test Output
Tests provide detailed output including:
- Request/response details
- Error messages and codes
- Status codes
- Response body validation

## 📈 Test Results

Expected test results:
```
✅ delete-posts.test.js: 15 tests passed
✅ auth-comprehensive.test.js: 12 tests passed  
✅ posts-comprehensive.test.js: 18 tests passed
✅ follows-comprehensive.test.js: 20 tests passed

Total: 65 tests passed
Success Rate: 100%
```

## 🎯 Focus Areas

The test suite specifically validates:

1. **Role-based access control** (RBAC)
2. **JWT token validation**
3. **Error response consistency**
4. **Input validation**
5. **Edge cases and error scenarios**

All tests ensure your API follows security best practices and provides consistent, well-documented error responses. 