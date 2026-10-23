const axios = require('axios');

// Test the search functionality
async function testSearch() {
  try {
    console.log('Testing search functionality...');
    
    // First, let's test without authentication to see if the endpoint exists
    try {
      const response = await axios.get('http://localhost:3000/api/social/users?q=test');
      console.log('Response without auth:', response.status, response.data);
    } catch (error) {
      console.log('Expected error without auth:', error.response?.status, error.response?.data?.message);
    }
    
    // Test with a simple search query
    const searchResponse = await axios.get('http://localhost:3000/api/social/users', {
      params: { q: 'test', limit: 10 },
      headers: {
        'Authorization': 'Bearer test-token' // This will fail but we can see the endpoint structure
      }
    });
    
    console.log('Search response:', searchResponse.data);
    
  } catch (error) {
    console.error('Error testing search:', error.response?.status, error.response?.data);
  }
}

testSearch(); 