/**
 * MongoDB Aggregation Demo - Social Network Analytics
 * 
 * Demonstrates the optimized aggregation pipeline for getting
 * 10 most recent posts from user's followings.
 */

const { MongoClient } = require('mongodb');
const { createIndexes, setupTestData, executeAggregation } = require('./aggregation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'social_network';

async function runDemo() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('follows').deleteMany({});
    await db.collection('posts').deleteMany({});
    
    // Setup indexes
    await createIndexes(db);
    
    // Setup test data
    await setupTestData(db);
    
    // Execute aggregation for user "u1"
    console.log('\n🔍 Running aggregation for user "u1"...');
    const results = await executeAggregation(db, "u1");
    
    console.log('\n📊 Results:');
    console.log(JSON.stringify(results, null, 2));
    
    console.log(`\n✅ Found ${results.length} posts from user's followings`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Run the demo
runDemo(); 