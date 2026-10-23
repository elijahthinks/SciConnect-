const axios = require('axios');

async function testCommentCreation() {
  try {
    console.log('🧪 Testing comment creation...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    try {
      await axios.get('http://localhost:3000/api/health');
      console.log('✅ Server is running\n');
    } catch (error) {
      console.log('❌ Server not responding, trying to start it...');
      return;
    }

    // Test 2: Try to create a comment without auth (should fail)
    console.log('2. Testing comment creation without auth...');
    try {
      await axios.post('http://localhost:3000/api/comments', {
        postId: 1,
        content: 'Test comment without auth'
      });
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without auth');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Try to create a comment with invalid data
    console.log('\n3. Testing comment creation with invalid data...');
    try {
      await axios.post('http://localhost:3000/api/comments', {
        // Missing postId
        content: 'Test comment without postId'
      });
      console.log('❌ Should have failed without postId');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected invalid data');
        console.log('Validation errors:', error.response.data.errors);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 4: Try to create a comment with invalid postId type
    console.log('\n4. Testing comment creation with string postId...');
    try {
      await axios.post('http://localhost:3000/api/comments', {
        postId: '1', // String instead of number
        content: 'Test comment with string postId'
      });
      console.log('❌ Should have failed with string postId');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected string postId');
        console.log('Validation errors:', error.response.data.errors);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n📋 Debugging steps:');
    console.log('1. Check browser console for the comment data being sent');
    console.log('2. Check server logs for validation errors');
    console.log('3. Verify that postId is a number, not a string');
    console.log('4. Check if the user is properly authenticated');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCommentCreation(); 