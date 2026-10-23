const axios = require('axios');

async function debugTest() {
  try {
    console.log('Testing basic auth endpoint...');
    
    const response = await axios.post('http://localhost:3000/api/auth/register', {
      name: 'DebugUser',
      email: 'debug@example.com',
      password: 'password123'
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.response?.data?.message) {
      console.error('Server message:', error.response.data.message);
    }
  }
}

debugTest(); 