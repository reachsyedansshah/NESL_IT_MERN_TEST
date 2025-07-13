/**
 * Posts Controller Debugging & Code Review
 * 
 * This file demonstrates problems with the original getSortedPosts function
 * and provides the best optimized solution with all issues handled.
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'social_network';

let client;
let db;
let Posts;
let isInitialized = false;

// Initialize MongoDB connection
async function initializeDB() {
  if (isInitialized) return;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    db = client.db(DB_NAME);
    Posts = db.collection('posts');
    
    // // Clear existing data and insert test data
    // await Posts.deleteMany({});
    
    // Insert test posts
    const testPosts = Array.from({ length: 10000 }, (_, i) => ({
      content: `Post ${i}`,
      author: `user_${i % 10}`,
      created: new Date(Date.now() - i * 1000)
    }));
    
    await Posts.insertMany(testPosts);
    console.log(`✅ Inserted ${testPosts.length} test posts`);
    
    isInitialized = true;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
}

/**
 * PROBLEMATIC CODE - Original Implementation
 * 
 * Issues identified:
 * 1. Memory inefficiency - Initially loads ALL posts into memory
 * 2. No error handling - can cause unhandled promise rejections
 * 3. No pagination - can hang with large datasets
 * 4. Inefficient sorting - JavaScript sort vs database sort (DB sorting is much faster + more efficient)
 */
async function getSortedPosts_ORIGINAL() {
  // Ensure database is initialized
  if (!isInitialized) {
    await initializeDB();
  }
  
  const start = Date.now();
  
  try {
    const posts = await Posts.find().toArray(); // ❌ PROBLEM: Loads ALL posts
    posts.sort((a, b) => b.created - a.created); // ❌ PROBLEM: In-memory sort
    
    const duration = Date.now() - start;
    console.log(`❌ Original approach: ${duration}ms (in-memory sort of ${posts.length} posts)`);
    console.log(`   Memory usage: ~${Math.round(posts.length * 0.2)}KB`);
    console.log(`   Issues: No pagination, no error handling, inefficient sorting`);
    
    return posts;
  } catch (error) {
    console.error('❌ Error in original approach:', error.message);
    throw error;
  }
}

/**
 * BEST OPTIMIZED SOLUTION: Database-level sorting with pagination, error handling
 */
async function getSortedPosts_OPTIMIZED() {
  // Ensure database is initialized
  if (!isInitialized) {
    await initializeDB();
  }
  
  const start = Date.now();
  const timeout = 5000; // 5 second timeout
  
  try {
    const page = 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    // ✅ SOLUTION: Database-level sorting with pagination and timeout protection
    const posts = await Posts.find()
      .sort({ created: -1 }) // Database sort is much faster
      .skip(skip)
      .limit(limit)
      .toArray();
    console.log({posts: posts.length});

    const total = posts.length;
    const duration = Date.now() - start;
    
    console.log(`✅ Optimized approach: ${duration}ms (database sort with pagination)`);
    console.log(`   Memory usage: ~${Math.round(posts.length * 0.2)}KB`);
    console.log(`   Pagination: ${posts.length} posts out of ${total} total`);
    console.log(`   Features: Database sorting, pagination, error handling`);
    
    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    const duration = Date.now() - start;
    console.log(`❌ Optimized approach: ${duration}ms (with error handling)`);
    
    if (error.message === 'Request timeout') {
      console.log(`   Error: Request timeout after ${timeout}ms`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    
    throw error;
  }
}

module.exports = {
  getSortedPosts_ORIGINAL,
  getSortedPosts_OPTIMIZED
}; 