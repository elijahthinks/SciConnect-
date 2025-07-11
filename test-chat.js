const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testChat() {
  console.log('🧪 Testing SciConnect Chat System...\n');

  try {
    // Test 1: Create two test users
    console.log('1. Creating test users...');
    
    const user1 = await axios.post(`${API_BASE}/auth/register`, {
      name: 'TestUser1',
      email: 'testuser1@example.com',
      password: 'password123'
    });
    
    const user2 = await axios.post(`${API_BASE}/auth/register`, {
      name: 'TestUser2', 
      email: 'testuser2@example.com',
      password: 'password123'
    });

    console.log('✅ Users created successfully');
    console.log(`   User 1: ${user1.data.user.name} (ID: ${user1.data.user.id})`);
    console.log(`   User 2: ${user2.data.user.name} (ID: ${user2.data.user.id})\n`);

    // Test 2: Get conversations (should be empty initially)
    console.log('2. Testing conversations endpoint...');
    
    const conversations1 = await axios.get(`${API_BASE}/chat/conversations`, {
      headers: { Authorization: `Bearer ${user1.data.token}` }
    });
    
    console.log(`✅ User 1 has ${conversations1.data.length} conversations\n`);

    // Test 3: Create a conversation between users
    console.log('3. Creating conversation between users...');
    
    const conversation = await axios.post(`${API_BASE}/chat/conversations`, {
      participantId: user2.data.user.id
    }, {
      headers: { Authorization: `Bearer ${user1.data.token}` }
    });
    
    console.log(`✅ Conversation created: ${conversation.data.conversationId}\n`);

    // Test 4: Send a message
    console.log('4. Sending a test message...');
    
    const message = await axios.post(`${API_BASE}/chat/conversations/${conversation.data.conversationId}/messages`, {
      content: 'Hello! This is a test message from the chat system.',
      messageType: 'text'
    }, {
      headers: { Authorization: `Bearer ${user1.data.token}` }
    });
    
    console.log(`✅ Message sent: "${message.data.content}"\n`);

    // Test 5: Get messages in conversation
    console.log('5. Retrieving messages from conversation...');
    
    const messages = await axios.get(`${API_BASE}/chat/conversations/${conversation.data.conversationId}/messages`, {
      headers: { Authorization: `Bearer ${user1.data.token}` }
    });
    
    console.log(`✅ Retrieved ${messages.data.length} messages`);
    console.log(`   Latest message: "${messages.data[messages.data.length - 1].content}"\n`);

    // Test 6: Test from user 2's perspective
    console.log('6. Testing from User 2 perspective...');
    
    const conversations2 = await axios.get(`${API_BASE}/chat/conversations`, {
      headers: { Authorization: `Bearer ${user2.data.token}` }
    });
    
    console.log(`✅ User 2 has ${conversations2.data.length} conversations`);
    
    if (conversations2.data.length > 0) {
      const user2Messages = await axios.get(`${API_BASE}/chat/conversations/${conversations2.data[0].conversationId}/messages`, {
        headers: { Authorization: `Bearer ${user2.data.token}` }
      });
      console.log(`   User 2 can see ${user2Messages.data.length} messages in the conversation\n`);
    }

    // Test 7: Send message from user 2
    console.log('7. User 2 sending a reply...');
    
    const reply = await axios.post(`${API_BASE}/chat/conversations/${conversation.data.conversationId}/messages`, {
      content: 'Hi! This is a reply from User 2. The chat system is working great!',
      messageType: 'text'
    }, {
      headers: { Authorization: `Bearer ${user2.data.token}` }
    });
    
    console.log(`✅ Reply sent: "${reply.data.content}"\n`);

    // Test 8: Mark conversation as read
    console.log('8. Marking conversation as read...');
    
    await axios.put(`${API_BASE}/chat/conversations/${conversation.data.conversationId}/read`, {}, {
      headers: { Authorization: `Bearer ${user1.data.token}` }
    });
    
    console.log('✅ Conversation marked as read\n');

    console.log('🎉 All chat tests passed successfully!');
    console.log('\n📱 To test the frontend:');
    console.log('   1. Open http://localhost:5173 in your browser');
    console.log('   2. Sign up with the test accounts:');
    console.log('      - Email: testuser1@example.com, Password: password123');
    console.log('      - Email: testuser2@example.com, Password: password123');
    console.log('   3. Click the messages icon in the navbar');
    console.log('   4. Start chatting between the two accounts!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testChat(); 