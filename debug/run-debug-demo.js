/**
 * Debug Demo Runner - Original vs Optimized Code
 * 
 * Demonstrates the problems with the original getSortedPosts function
 * and shows the best optimized solution.
 */

const { 
  getSortedPosts_ORIGINAL,
  getSortedPosts_OPTIMIZED
} = require('./posts-debug.js');

async function runDebugDemo() {
  console.log('🔍 ORIGINAL vs OPTIMIZED CODE DEMO');
  console.log('===================================\n');

  // 1. Original Function
  console.log('1️⃣ ORIGINAL FUNCTION (PROBLEMATIC):');
  await getSortedPosts_ORIGINAL();
  
  console.log('');

  // 2. Optimized Function
  console.log('2️⃣ OPTIMIZED FUNCTION (BEST SOLUTION):');
  await getSortedPosts_OPTIMIZED();
  console.log('');



  console.log('✅ DEMO COMPLETED!');
}

// Run the demo
runDebugDemo().catch(console.error); 