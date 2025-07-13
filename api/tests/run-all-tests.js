/**
 * Test Runner Script
 * 
 * Runs all comprehensive tests for the API
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Starting Comprehensive API Tests...\n');

const testFiles = [
  'auth-comprehensive.test.js',
  'posts-comprehensive.test.js',
  'follows-comprehensive.test.js',
  'delete-posts.test.js'
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

testFiles.forEach((testFile, index) => {
  console.log(`\n📋 Running ${testFile} (${index + 1}/${testFiles.length})`);
  console.log('='.repeat(50));
  
  try {
    const result = execSync(`npx jest tests/${testFile} --verbose --detectOpenHandles`, {
      cwd: __dirname,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log(result);
    
    // Count tests from output
    const testMatches = result.match(/(\d+) tests? passed/g);
    if (testMatches) {
      const testCount = parseInt(testMatches[0].split(' ')[0]);
      passedTests += testCount;
      totalTests += testCount;
    }
    
  } catch (error) {
    console.error(`❌ ${testFile} failed:`);
    console.error(error.stdout || error.message);
    
    // Count failed tests
    const failedMatches = error.stdout?.match(/(\d+) tests? failed/g);
    if (failedMatches) {
      const failedCount = parseInt(failedMatches[0].split(' ')[0]);
      failedTests += failedCount;
      totalTests += failedCount;
    }
  }
});

console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed. Please check the output above.');
  process.exit(1);
} 