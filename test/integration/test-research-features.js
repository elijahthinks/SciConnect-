const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123'
};

async function testResearchFeatures() {
  console.log('🧪 Testing Research Features...\n');

  try {
    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_USER);
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Set auth header for subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 2. Test creating a research post
    console.log('2. Testing research post creation...');
    const researchPost = {
      content: 'This is a test research post about machine learning applications in healthcare.',
      researchType: 'experiment',
      methodology: 'We conducted a randomized controlled trial with 1000 participants.',
      results: 'Our results show a 25% improvement in diagnostic accuracy.',
      conclusions: 'Machine learning can significantly improve healthcare outcomes.',
      citations: [
        {
          title: 'Machine Learning in Healthcare',
          authors: 'Smith, J. et al.',
          journal: 'Nature Medicine',
          year: '2023'
        }
      ],
      doi: '10.1038/s41591-023-02456-8',
      openAccess: true,
      funding: 'Funded by NIH Grant #12345',
      conflictsOfInterest: 'None declared',
      tags: ['machine-learning', 'healthcare', 'ai'],
      visibility: 'public'
    };

    const postResponse = await axios.post(`${BASE_URL}/research`, researchPost);
    const postId = postResponse.data.id;
    console.log('✅ Research post created successfully\n');

    // 3. Test fetching research posts
    console.log('3. Testing research posts fetch...');
    const postsResponse = await axios.get(`${BASE_URL}/research`);
    console.log(`✅ Found ${postsResponse.data.posts.length} research posts\n`);

    // 4. Test creating a fact check
    console.log('4. Testing fact check creation...');
    const factCheck = {
      type: 'clarification',
      content: 'This research methodology appears sound, but additional validation studies would strengthen the conclusions.',
      severity: 'medium',
      evidence: 'Similar studies in the field have shown comparable results.',
      citations: [
        {
          title: 'Validation Studies in ML Healthcare',
          authors: 'Johnson, A. et al.',
          journal: 'Science',
          year: '2023'
        }
      ]
    };

    const factCheckResponse = await axios.post(`${BASE_URL}/research/${postId}/fact-checks`, factCheck);
    console.log('✅ Fact check created successfully\n');

    // 5. Test voting on fact check
    console.log('5. Testing fact check voting...');
    const factCheckId = factCheckResponse.data.id;
    await axios.post(`${BASE_URL}/research/fact-checks/${factCheckId}/vote`, { vote: 'up' });
    console.log('✅ Fact check vote recorded successfully\n');

    // 6. Test collaboration invitation
    console.log('6. Testing collaboration invitation...');
    const collaboration = {
      userId: 1, // Assuming user ID 1 exists
      role: 'contributor',
      contribution: 'Will provide statistical analysis and data validation.',
      expertise: ['statistics', 'data-analysis', 'validation']
    };

    const collaborationResponse = await axios.post(`${BASE_URL}/research/${postId}/collaborations`, collaboration);
    console.log('✅ Collaboration invitation sent successfully\n');

    // 7. Test fetching fact checks
    console.log('7. Testing fact checks fetch...');
    const factChecksResponse = await axios.get(`${BASE_URL}/research/${postId}/fact-checks`);
    console.log(`✅ Found ${factChecksResponse.data.length} fact checks\n`);

    // 8. Test fetching collaborations
    console.log('8. Testing collaborations fetch...');
    const collaborationsResponse = await axios.get(`${BASE_URL}/research/${postId}/collaborations`);
    console.log(`✅ Found ${collaborationsResponse.data.length} collaborations\n`);

    console.log('🎉 All research feature tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Research post creation: ✅');
    console.log('- Research posts fetching: ✅');
    console.log('- Fact check creation: ✅');
    console.log('- Fact check voting: ✅');
    console.log('- Collaboration invitation: ✅');
    console.log('- Fact checks fetching: ✅');
    console.log('- Collaborations fetching: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('URL:', error.config?.url);
  }
}

// Run the tests
testResearchFeatures(); 