const axios = require('axios');
const jwt = require('jsonwebtoken');

// Create a test token for debugging
const createTestToken = (userId) => {
  return jwt.sign(
    { id: userId, email: 'test@example.com' },
    'your-secret-key', // This should match your actual secret
    { expiresIn: '1h' }
  );
};

async function debugSearch() {
  try {
    console.log('🔍 Debugging search functionality...');
    
    // Test token (you'll need to replace with a real user ID from your database)
    const testToken = createTestToken(1);
    
    // Test the search endpoint
    const searchResponse = await axios.get('http://localhost:3000/api/social/users', {
      params: { q: 'test', limit: 10 },
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    console.log('✅ Search response:', searchResponse.data);
    console.log('📊 Users found:', searchResponse.data.users?.length || 0);
    
    // Test without search query to see all users
    const allUsersResponse = await axios.get('http://localhost:3000/api/social/users', {
      params: { limit: 10 },
      headers: {
        'Authorization': `Bearer ${testToken}`
      }
    });
    
    console.log('✅ All users response:', allUsersResponse.data);
    console.log('📊 Total users available:', allUsersResponse.data.users?.length || 0);
    
    if (allUsersResponse.data.users?.length > 0) {
      console.log('👥 Sample users:');
      allUsersResponse.data.users.slice(0, 3).forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.username})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging search:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔐 Authentication failed - you may need to use a real token from a logged-in user');
    }
  }
}

debugSearch(); 