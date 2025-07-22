const axios = require('axios');

async function testCommentWithAuth() {
  try {
    console.log('🧪 Testing comment creation with authentication...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    try {
      await axios.get('http://localhost:3000/api/health');
      console.log('✅ Server is running\n');
    } catch (error) {
      console.log('❌ Server not responding');
      return;
    }

    // Test 2: Try to create a comment with proper data types
    console.log('2. Testing comment creation with proper data types...');
    try {
      await axios.post('http://localhost:3000/api/comments', {
        postId: 1, // Number
        content: 'Test comment with proper data types'
      });
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without auth');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Try to create a comment with string postId
    console.log('\n3. Testing comment creation with string postId...');
    try {
      await axios.post('http://localhost:3000/api/comments', {
        postId: '1', // String
        content: 'Test comment with string postId'
      });
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without auth');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n📋 Next steps to test in browser:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Log in to your account');
    console.log('3. Go to a post and try to add a comment');
    console.log('4. Check the browser console for the debug logs');
    console.log('5. Check the server console for any errors');
    console.log('\n🔧 If comments still don\'t work:');
    console.log('- Check if you\'re logged in (localStorage should have auth data)');
    console.log('- Check browser console for any JavaScript errors');
    console.log('- Check server logs for validation or database errors');
    console.log('- Try creating a new post first, then comment on it');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCommentWithAuth(); 