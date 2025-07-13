# MongoDB Aggregation & Data Modeling - Social Network Analytics

## Overview
Optimized MongoDB solution for social network analytics with efficient collection schemas, aggregation pipeline, and indexing strategy.

## Prerequisites

Before running the aggregation demo, ensure you have:

1. **Node.js** (v14 or higher)
2. **MongoDB** running locally or accessible via connection string
3. **npm** or **yarn** package manager

## Installation

1. **Navigate to the db directory:**
   ```bash
   cd NESL_IT_MERN_TEST/db
   ```

2. **Install dependencies:**
   ```bash
   npm install mongodb
   ```

3. **Create package.json (if not exists):**
   ```bash
   npm init -y
   ```

## MongoDB Connection

### Option 1: Local MongoDB
If you have MongoDB running locally:
```bash
# Start MongoDB (if not running)
mongod

# The script will connect to: mongodb://localhost:27017
```

### Option 2: MongoDB Atlas or Remote
Set the connection string as environment variable:
```bash
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/social_network"
```

### Option 3: Docker MongoDB
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Connect to: mongodb://localhost:27017
```

## Running the Aggregation Demo

1. **Execute the aggregation script:**
   ```bash
   node run-aggregation.js
   ```

2. **Expected output:**
   ```
   ✅ Connected to MongoDB
   ✅ Indexes created for optimal performance
   🔍 Running aggregation for user "u2"...
   Executing aggregation for user: u2
   ✅ Aggregation completed in 45ms
   
   📊 Results:
   [
     {
       "_id": "p22",
       "content": "Working on new features",
       "created": "2024-03-13T10:30:00.000Z",
       "authorName": "Bob"
     },
     ...
   ]
   
   ✅ Found 10 posts from user's followings
   ```

## Troubleshooting

### Common Issues:

1. **"Cannot find module 'mongodb'"**
   ```bash
   npm install mongodb
   ```

2. **"MongoServerSelectionError"**
   - Ensure MongoDB is running
   - Check connection string
   - Verify network connectivity

3. **"Authentication failed"**
   - Check username/password in connection string
   - Ensure user has proper permissions

4. **"Port 27017 already in use"**
   ```bash
   # Find and kill MongoDB process
   lsof -ti:27017 | xargs kill -9
   ```

## 1. Collection Schemas Design

**users**: `{ _id: ObjectId, name: String, joined: Date }`
**follows**: `{ follower: String, following: String }`
**posts**: `{ _id: ObjectId, author: String, content: String, created: Date }`

**Design Principles:**
- String IDs in follows for efficient joins
- Minimal fields for maximum performance
- created timestamps for chronological sorting

## 2. Aggregation Pipeline

The `getFollowingsPosts(userId)` function returns the 10 most recent posts from a user's followings with:
- Post content
- Creation date
- Author name

**Pipeline Stages:**
1. Match user's followings
2. Lookup posts from followed users
3. Unwind posts array
4. Lookup author details
5. Unwind author array
6. Project required fields
7. Sort by creation date (newest first)
8. Limit to 10 posts

## 3. Indexing Strategy for Maximum Read Performance

**Users Collection:**
- `{ _id: 1 }` (primary key, auto-indexed)
- `{ name: 1 }` (for author name lookups)

**Follows Collection:**
- `{ follower: 1 }` (find who user follows)
- `{ following: 1 }` (find user's followers)
- `{ follower: 1, following: 1 }` (unique relationships)

**Posts Collection:**
- `{ author: 1, created: -1 }` (user's posts chronologically)
- `{ created: -1 }` (global chronological sorting)

## Performance Benefits

- **O(log n)** lookups for follower/following queries
- **Efficient joins** using String IDs in follows collection
- **Compound indexes** support chronological sorting
- **Minimal field projection** reduces memory usage

## Usage

```javascript
const { getFollowingsPosts, createIndexes, setupTestData, executeAggregation } = require('./aggregation');

// Setup indexes
await createIndexes(db);

// Setup test data
await setupTestData(db);

// Execute aggregation
const results = await executeAggregation(db, "u1");
```

## Files

- `aggregation.js` - Main aggregation pipeline, indexing strategy, and utilities
- `run-aggregation.js` - Execution script with MongoDB connection 