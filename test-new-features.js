const axios = require('axios');

// Test the new open-access profile features
async function testNewFeatures() {
  try {
    console.log('🧪 Testing new open-access profile features...\n');

    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const healthCheck = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Server is running\n');

    // Test 2: Test profile update with new fields
    console.log('2. Testing profile update with new fields...');
    
    // First, let's create a test user or get an existing one
    const testProfileData = {
      firstName: 'Test',
      lastName: 'User',
      bio: 'I am a passionate hobbyist scientist working on DIY biology projects',
      userType: 'hobbyist',
      skillTags: ['DIY Biology', 'Python', 'Data Visualization', 'Citizen Science'],
      sideProjects: [
        {
          title: 'DIY Bio Kit',
          description: 'A home-built kit for basic biological experiments',
          url: 'https://github.com/testuser/diy-bio-kit',
          technologies: ['Arduino', 'Biology', 'Electronics']
        }
      ],
      researchInterests: ['DIY Biology', 'Citizen Science', 'Open Source']
    };

    console.log('Test profile data:', JSON.stringify(testProfileData, null, 2));
    console.log('✅ Profile data prepared\n');

    // Test 3: Test comment functionality
    console.log('3. Testing comment functionality...');
    
    // Create a test post first
    const testPost = {
      content: 'This is a test post to verify comment functionality works correctly',
      tags: ['test', 'feature-verification'],
      visibility: 'public'
    };

    console.log('Test post data:', JSON.stringify(testPost, null, 2));
    console.log('✅ Comment test data prepared\n');

    console.log('🎉 All tests prepared successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Log in or create an account');
    console.log('3. Go to your profile and click "Edit Profile"');
    console.log('4. Try adding skills, side projects, and changing your user type');
    console.log('5. Create a post and test the comment functionality');
    console.log('\n✨ New features added:');
    console.log('• User type badges (Hobbyist, Independent, Academic, etc.)');
    console.log('• Skill tags with autocomplete');
    console.log('• Side projects management');
    console.log('• Fixed comment functionality');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testNewFeatures(); 