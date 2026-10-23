const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testPosts() {
  try {
    console.log('Testing Posts API...\n');

    // Test 1: Get all posts (should be empty initially)
    console.log('1. Getting all posts...');
    const postsResponse = await axios.get(`${API_BASE}/posts`);
    console.log('Posts found:', postsResponse.data.length);
    console.log('Response:', postsResponse.data);
    console.log('');

    // Test 2: Create a post (this will fail without auth, but we can test the endpoint exists)
    console.log('2. Testing post creation endpoint...');
    try {
      await axios.post(`${API_BASE}/posts`, {
        content: 'Test post content'
      });
    } catch (err) {
      console.log('Expected error (no auth):', err.response?.status, err.response?.data?.message);
    }
    console.log('');

    console.log('Posts API test completed!');
    console.log('To test with authentication, you need to:');
    console.log('1. Create a user account');
    console.log('2. Login to get a JWT token');
    console.log('3. Use the token in the Authorization header');

  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

testPosts(); 