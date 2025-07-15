const User = require('./models/User');
const sequelize = require('./db');

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Sync database
    await sequelize.sync();
    
    // Count users
    const userCount = await User.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      // Get sample users
      const users = await User.findAll({
        limit: 5,
        attributes: ['id', 'username', 'firstName', 'lastName', 'email']
      });
      
      console.log('👥 Sample users:');
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Name: ${user.firstName} ${user.lastName}, Username: ${user.username}, Email: ${user.email}`);
      });
      
      // Test search query
      const searchResults = await User.findAll({
        where: {
          [sequelize.Op.or]: [
            { firstName: { [sequelize.Op.iLike]: '%test%' } },
            { lastName: { [sequelize.Op.iLike]: '%test%' } },
            { username: { [sequelize.Op.iLike]: '%test%' } }
          ]
        },
        attributes: ['id', 'username', 'firstName', 'lastName']
      });
      
      console.log(`🔍 Search results for 'test': ${searchResults.length} users found`);
      
    } else {
      console.log('❌ No users found in database');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await sequelize.close();
  }
}

checkUsers(); 