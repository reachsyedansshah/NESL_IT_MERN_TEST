/**
 * MongoDB Aggregation & Data Modeling - Social Network Analytics
 * 
 * Optimized for maximum read performance with efficient schemas and indexing.
 */

// QUESTION 1. COLLECTION SCHEMAS DESIGN 
/*
users: { _id: ObjectId, name: String, joined: Date }
follows: { follower: String, following: String }
posts: { _id: ObjectId, author: String, content: String, created: Date }

Design principles:
- String IDs in follows for efficient joins
- Minimal fields for maximum performance
- created timestamps for chronological sorting
*/

// QUESTION 2. AGGREGATION PIPELINE: Get 10 most recent posts from user's followings
const getFollowingsPosts = (userId) => [
  // Find users that the given user follows
  { $match: { follower: userId } },
  
  // Lookup posts from followed users
  {
    $lookup: {
      from: "posts",
      localField: "following",
      foreignField: "author",
      as: "posts"
    }
  },
  
  // Unwind posts array
  { $unwind: { path: "$posts", preserveNullAndEmptyArrays: false } },
  
  // Lookup author details
  {
    $lookup: {
      from: "users",
      localField: "posts.author",
      foreignField: "_id",
      as: "author"
    }
  },
  
  // Unwind author array
  { $unwind: { path: "$author", preserveNullAndEmptyArrays: false } },
  
  // Project required fields
  {
    $project: {
      _id: "$posts._id",
      content: "$posts.content",
      created: "$posts.created",
      authorName: "$author.name"
    }
  },
  
  // Sort by creation date (newest first)
  { $sort: { created: -1 } },
  
  // Limit to 10 most recent posts
  { $limit: 10 }
];

// QUESTION 3. INDEXING STRATEGY FOR MAXIMUM READ PERFORMANCE
const createIndexes = async (db) => {
  // Users: { _id: 1 } (primary key, auto-indexed)
  await db.collection('users').createIndex({ name: 1 });
  
  // Follows: Efficient follower/following queries
  await db.collection('follows').createIndex({ follower: 1 });
  await db.collection('follows').createIndex({ following: 1 });
  await db.collection('follows').createIndex({ follower: 1, following: 1 }, { unique: true });
  
  // Posts: Chronological sorting and author lookups
  await db.collection('posts').createIndex({ author: 1, created: -1 });
  await db.collection('posts').createIndex({ created: -1 });
};

// Test data setup
const setupTestData = async (db) => {
  await db.collection('users').insertMany([
    { _id: "u1", name: "Alice", joined: new Date("2024-01-15T09:00Z") },
    { _id: "u2", name: "Bob", joined: new Date("2024-02-02T12:30Z") },
    { _id: "u3", name: "Charlie", joined: new Date("2024-03-01T15:45Z") }
  ]);
  
  await db.collection('follows').insertMany([
    { follower: "u1", following: "u2" },
    { follower: "u1", following: "u3" },
    { follower: "u2", following: "u1" }
  ]);
  
  await db.collection('posts').insertMany([
    { _id: "p1", author: "u2", content: "Hello!", created: new Date("2024-03-10T18:00Z") },
    { _id: "p2", author: "u2", content: "Hey Bob", created: new Date("2024-03-11T09:15Z") },
    { _id: "p3", author: "u3", content: "Great day!", created: new Date("2024-03-12T14:20Z") },
    { _id: "p4", author: "u2", content: "Working on new features", created: new Date("2024-03-13T10:30Z") },
    { _id: "p5", author: "u2", content: "Hello!", created: new Date("2024-03-10T18:00Z") },
    { _id: "p6", author: "u2", content: "Hey Bob", created: new Date("2024-03-11T09:15Z") },
    { _id: "p7", author: "u3", content: "Great day!", created: new Date("2024-03-12T14:20Z") },
    { _id: "p8", author: "u2", content: "Working on new features", created: new Date("2024-03-13T10:30Z") },
    { _id: "p9", author: "u2", content: "Hello!", created: new Date("2024-03-10T18:00Z") },
    { _id: "p10", author: "u2", content: "Hey Bob", created: new Date("2024-03-11T09:15Z") },
    { _id: "p11", author: "u2", content: "Hello!", created: new Date("2024-03-10T18:00Z") },
    { _id: "p12", author: "u2", content: "Hey Bob", created: new Date("2024-03-11T09:15Z") },
    { _id: "p13", author: "u3", content: "Great day!", created: new Date("2024-03-12T14:20Z") },
    { _id: "p14", author: "u2", content: "Working on new features", created: new Date("2024-03-13T10:30Z") },
    { _id: "p15", author: "u2", content: "Hello!", created: new Date("2024-03-10T18:00Z") },
    { _id: "p16", author: "u2", content: "Hey Bob", created: new Date("2024-03-11T09:15Z") },
    { _id: "p17", author: "u3", content: "Great day!", created: new Date("2024-03-12T14:20Z") },
    { _id: "p18", author: "u2", content: "Working on new features", created: new Date("2024-03-13T10:30Z") },
    { _id: "p19", author: "u2", content: "Hello!", created: new Date("2024-03-10T18:00Z") },  
    { _id: "p20", author: "u2", content: "Hey Bob", created: new Date("2024-03-11T09:15Z") },
    { _id: "p21", author: "u3", content: "Great day!", created: new Date("2024-03-12T14:20Z") },
    { _id: "p22", author: "u2", content: "Working on new features", created: new Date("2024-03-13T10:30Z") },

  
  ]);
};

// Execute aggregation with performance monitoring
const executeAggregation = async (db, userId) => {
  const startTime = Date.now();
  console.log("Executing aggregation for user:", userId);
  const pipeline = getFollowingsPosts(userId);
  const result = await db.collection('follows').aggregate(pipeline).toArray();
  console.log(`✅ Aggregation completed in ${Date.now() - startTime}ms`);
  return result;
};

module.exports = {
  getFollowingsPosts,
  createIndexes,
  setupTestData,
  executeAggregation
}; 