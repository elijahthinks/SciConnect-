require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../db');
const User = require('../models/User');
const Post = require('../models/Post');

// Import all models to ensure relationships are established
require('../models/Comment');
require('../models/Notification');
require('../models/Reaction');
require('../models/Message');
require('../models/Conversation');
require('../models/UserRelationship');
require('../models/GroupChat');
require('../models/GroupChatMember');
require('../models/GroupMessage');

const seedUsers = [
  {
    username: 'alexrivera',
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex.rivera@riverbend.edu',
    password: 'password123',
    fieldOfStudy: 'Environmental Science',
    institution: 'Riverbend State University',
    position: 'Undergraduate Student',
    userType: 'student',
    bio: 'Developing a DIY water‐quality test kit to monitor local streams. Loves mentoring incoming freshmen and organizing weekend creek cleanups.',
    skillTags: ['Microplastics', 'FieldSampling', 'DataAnalysis', 'WaterQuality', 'Mentoring'],
    researchInterests: ['Environmental Monitoring', 'Citizen Science', 'Water Quality Assessment'],
    sideProjects: [
      {
        name: 'DIY Water Quality Test Kit',
        description: 'Low-cost water quality monitoring system for local streams',
        status: 'In Progress',
        technologies: ['Arduino', 'Sensors', 'Data Analysis']
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Environmental Science',
        institution: 'Riverbend State University',
        year: '2025 (Expected)',
        current: true
      }
    ]
  },
  {
    username: 'priyashah',
    firstName: 'Priya',
    lastName: 'Shah',
    email: 'priya.shah@pinecrest.edu',
    password: 'password123',
    fieldOfStudy: 'Machine Learning',
    institution: 'Pinecrest Technical Institute',
    position: 'Master\'s Student',
    userType: 'student',
    bio: 'Building lightweight CNNs for plant disease detection on smartphones. Runs a weekly peer study group on deep-learning ethics.',
    skillTags: ['NeuralNetworks', 'ComputerVision', 'GradLife', 'DeepLearning', 'Ethics'],
    researchInterests: ['Computer Vision', 'Plant Disease Detection', 'AI Ethics'],
    sideProjects: [
      {
        name: 'Plant Disease Detection App',
        description: 'Mobile app using CNN for real-time plant disease identification',
        status: 'In Development',
        technologies: ['TensorFlow', 'React Native', 'CNN']
      }
    ],
    education: [
      {
        degree: 'Master of Science',
        field: 'Machine Learning',
        institution: 'Pinecrest Technical Institute',
        year: '2025 (Expected)',
        current: true
      }
    ]
  },
  {
    username: 'jordankim',
    firstName: 'Jordan',
    lastName: 'Kim',
    email: 'jordan.kim@highland.edu',
    password: 'password123',
    fieldOfStudy: 'Astronomy',
    institution: 'Highland College of Arts & Sciences',
    position: 'Undergraduate Student',
    userType: 'student',
    bio: 'Writing my own star-charting scripts to track meteor showers. Always up for nighttime telescope sessions and hackathons.',
    skillTags: ['Astrophotography', 'Python', 'StarGazing', 'DataVisualization', 'Telescopes'],
    researchInterests: ['Astrophotography', 'Meteor Shower Tracking', 'Astronomical Data Analysis'],
    sideProjects: [
      {
        name: 'Star Charting Scripts',
        description: 'Python scripts for tracking meteor showers and celestial events',
        status: 'Active',
        technologies: ['Python', 'Astronomy APIs', 'Data Visualization']
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Astronomy',
        institution: 'Highland College of Arts & Sciences',
        year: '2027 (Expected)',
        current: true
      }
    ]
  },
  {
    username: 'carlosmendes',
    firstName: 'Carlos',
    lastName: 'Mendes',
    email: 'carlos.mendes@citizen.science',
    password: 'password123',
    fieldOfStudy: 'DIY Electronics & Citizen Science',
    institution: 'Self-taught',
    position: 'Hobbyist',
    userType: 'hobbyist',
    bio: 'Designing low-cost air-quality monitors with off-the-shelf sensors. Shares build guides and PCB layouts—no lab coat required!',
    skillTags: ['Arduino', 'SensorBuilds', 'OpenHardware', 'PCBDesign', 'AirQuality'],
    researchInterests: ['Citizen Science', 'Environmental Monitoring', 'Open Source Hardware'],
    sideProjects: [
      {
        name: 'Low-Cost Air Quality Monitor',
        description: 'DIY air quality monitoring system using off-the-shelf sensors',
        status: 'Active',
        technologies: ['Arduino', 'Sensors', 'PCB Design', 'Open Source']
      }
    ],
    education: [
      {
        degree: 'Self-taught',
        field: 'Electronics & Citizen Science',
        institution: 'Various Online Resources',
        year: 'Ongoing',
        current: true
      }
    ]
  },
  {
    username: 'anikadas',
    firstName: 'Anika',
    lastName: 'Das',
    email: 'anika.das@urban.botany',
    password: 'password123',
    fieldOfStudy: 'Urban Botany & Photography',
    institution: 'Independent Researcher',
    position: 'Hobbyist',
    userType: 'hobbyist',
    bio: 'Documenting street-tree species and their health via high-res macro shots. Passionate about turning park walks into citizen-science surveys.',
    skillTags: ['PlantID', 'FieldNotes', 'MacroPhotography', 'CitizenScience', 'UrbanEcology'],
    researchInterests: ['Urban Botany', 'Street Tree Health', 'Citizen Science Photography'],
    sideProjects: [
      {
        name: 'Street Tree Health Survey',
        description: 'Documenting and monitoring urban tree health through photography',
        status: 'Active',
        technologies: ['Photography', 'Plant Identification', 'Data Collection']
      }
    ],
    education: [
      {
        degree: 'Self-taught',
        field: 'Urban Botany & Photography',
        institution: 'Independent Study',
        year: 'Ongoing',
        current: true
      }
    ]
  }
];

const samplePosts = [
  // Alex Rivera's posts
  {
    username: 'alexrivera',
    content: 'Just finished testing my DIY water quality kit at the local creek! The pH levels are concerning - we need to investigate the upstream sources. Anyone interested in joining our weekend cleanup? #Microplastics #FieldSampling #CitizenScience',
    tags: ['Microplastics', 'FieldSampling', 'CitizenScience', 'WaterQuality'],
    visibility: 'public'
  },
  {
    username: 'alexrivera',
    content: 'Mentoring session with freshmen today was amazing! Taught them how to use basic water testing equipment. Seeing their excitement about environmental science reminds me why I chose this field. #Mentoring #EnvironmentalScience #NextGeneration',
    tags: ['Mentoring', 'EnvironmentalScience', 'NextGeneration'],
    visibility: 'public'
  },
  {
    username: 'alexrivera',
    content: 'Weekend creek cleanup results: 15 bags of trash collected, mostly plastic bottles and food wrappers. The community response was incredible! Next month we\'re expanding to three more locations. #CommunityAction #EnvironmentalProtection #FieldWork',
    tags: ['CommunityAction', 'EnvironmentalProtection', 'FieldWork'],
    visibility: 'public'
  },

  // Priya Shah's posts
  {
    username: 'priyashah',
    content: 'Breakthrough moment! My lightweight CNN model achieved 94% accuracy on plant disease detection while using only 2MB of memory. Perfect for smartphone deployment. The key was optimizing the architecture for mobile constraints. #NeuralNetworks #ComputerVision #MobileAI',
    tags: ['NeuralNetworks', 'ComputerVision', 'MobileAI', 'PlantDisease'],
    visibility: 'public'
  },
  {
    username: 'priyashah',
    content: 'Deep learning ethics discussion today was intense! We debated bias in training data and its impact on agricultural applications. Important reminder that technical solutions need ethical frameworks. #AIEthics #DeepLearning #ResponsibleAI',
    tags: ['AIEthics', 'DeepLearning', 'ResponsibleAI'],
    visibility: 'public'
  },
  {
    username: 'priyashah',
    content: 'Grad life update: Survived another week of research, teaching, and coding. The peer study group is growing - we now have 15 regular members! Next week we\'re discussing interpretability in neural networks. #GradLife #Research #Community',
    tags: ['GradLife', 'Research', 'Community', 'NeuralNetworks'],
    visibility: 'public'
  },

  // Jordan Kim's posts
  {
    username: 'jordankim',
    content: 'Clear night tonight! Captured some amazing shots of the Perseid meteor shower. My Python script successfully tracked 23 meteors over 2 hours. The data visualization is coming along nicely. #Astrophotography #Python #StarGazing #MeteorShower',
    tags: ['Astrophotography', 'Python', 'StarGazing', 'MeteorShower'],
    visibility: 'public'
  },
  {
    username: 'jordankim',
    content: 'First-year astronomy student here! Just learned how to use the campus telescope. The view of Jupiter\'s moons was incredible. Anyone up for a late-night stargazing session this weekend? #FirstYear #Telescope #Jupiter #Astronomy',
    tags: ['FirstYear', 'Telescope', 'Jupiter', 'Astronomy'],
    visibility: 'public'
  },
  {
    username: 'jordankim',
    content: 'Hackathon idea: Real-time meteor tracking app using smartphone sensors and GPS. Could revolutionize citizen science data collection. Looking for collaborators! #Hackathon #CitizenScience #MobileApp #DataCollection',
    tags: ['Hackathon', 'CitizenScience', 'MobileApp', 'DataCollection'],
    visibility: 'public'
  },

  // Carlos Mendes's posts
  {
    username: 'carlosmendes',
    content: 'New PCB design for the air quality monitor is ready! Using off-the-shelf sensors to keep costs under $50. The build guide will be up on GitHub next week. No lab coat required! #Arduino #SensorBuilds #OpenHardware #AirQuality',
    tags: ['Arduino', 'SensorBuilds', 'OpenHardware', 'AirQuality'],
    visibility: 'public'
  },
  {
    username: 'carlosmendes',
    content: 'Citizen science is the future! My air quality monitors are now deployed in 5 different neighborhoods. The data shows significant variations in PM2.5 levels throughout the day. #CitizenScience #EnvironmentalMonitoring #DataAnalysis',
    tags: ['CitizenScience', 'EnvironmentalMonitoring', 'DataAnalysis'],
    visibility: 'public'
  },
  {
    username: 'carlosmendes',
    content: 'Just finished a workshop teaching high school students how to build their own sensors. Their enthusiasm was incredible! The next generation of citizen scientists is here. #Workshop #Education #NextGeneration #DIY',
    tags: ['Workshop', 'Education', 'NextGeneration', 'DIY'],
    visibility: 'public'
  },

  // Anika Das's posts
  {
    username: 'anikadas',
    content: 'Morning walk turned into a citizen science survey! Documented 12 different street tree species in just 3 blocks. The macro shots reveal some concerning signs of urban stress. #PlantID #FieldNotes #UrbanEcology #MacroPhotography',
    tags: ['PlantID', 'FieldNotes', 'UrbanEcology', 'MacroPhotography'],
    visibility: 'public'
  },
  {
    username: 'anikadas',
    content: 'Urban botany discovery: Found a rare native species thriving in a sidewalk crack! Nature finds a way even in the most urban environments. The high-res photos show incredible detail. #UrbanBotany #NativeSpecies #Resilience #Photography',
    tags: ['UrbanBotany', 'NativeSpecies', 'Resilience', 'Photography'],
    visibility: 'public'
  },
  {
    username: 'anikadas',
    content: 'Citizen science survey results: 47% of street trees show signs of stress (leaf damage, bark wounds). Time to advocate for better urban tree care policies. #CitizenScience #UrbanPlanning #TreeHealth #Advocacy',
    tags: ['CitizenScience', 'UrbanPlanning', 'TreeHealth', 'Advocacy'],
    visibility: 'public'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Clear existing data in the correct order to avoid FK constraint errors
    console.log('🧹 Clearing existing data...');
    const Comment = require('../models/Comment');
    const Reaction = require('../models/Reaction');
    const Notification = require('../models/Notification');
    const Message = require('../models/Message');
    const Conversation = require('../models/Conversation');
    const UserRelationship = require('../models/UserRelationship');
    const GroupChatMember = require('../models/GroupChatMember');
    const GroupMessage = require('../models/GroupMessage');
    const GroupChat = require('../models/GroupChat');

    await Reaction.destroy({ where: {}, force: true });
    await Comment.destroy({ where: {}, force: true });
    await Notification.destroy({ where: {}, force: true });
    await Message.destroy({ where: {}, force: true });
    await GroupMessage.destroy({ where: {}, force: true });
    await GroupChatMember.destroy({ where: {}, force: true });
    await GroupChat.destroy({ where: {}, force: true });
    await Conversation.destroy({ where: {}, force: true });
    await UserRelationship.destroy({ where: {}, force: true });
    await Post.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    console.log('✅ Existing data cleared');
    
    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    
    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        isEmailVerified: true,
        lastActive: new Date()
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.username}`);
    }
    
    // Create posts
    console.log('📝 Creating posts...');
    const userMap = {};
    createdUsers.forEach(user => {
      userMap[user.username] = user.id;
    });
    
    for (const postData of samplePosts) {
      const userId = userMap[postData.username];
      if (userId) {
        await Post.create({
          userId: userId,
          content: postData.content,
          tags: postData.tags,
          visibility: postData.visibility,
          likes: [],
          comments: 0,
          shares: 0
        });
        console.log(`✅ Created post for ${postData.username}`);
      }
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${createdUsers.length} users and ${samplePosts.length} posts`);
    
    // Display summary
    console.log('\n📋 User Summary:');
    createdUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (@${user.username}) - ${user.position} at ${user.institution}`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the seeding
seedDatabase(); 