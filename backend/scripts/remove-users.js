const User = require('./models/User');
const sequelize = require('./db');

async function removeUsers() {
  try {
    await sequelize.sync();
    
    console.log('🔍 Checking current users...\n');
    
    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'position', 'institution']
    });
    
    console.log('Current users:');
    users.forEach(u => {
      console.log(`${u.id}: ${u.firstName} ${u.lastName} - ${u.position || 'No position'} at ${u.institution || 'No institution'}`);
    });
    
    // Users to remove based on the description
    const usersToRemove = [
      { firstName: 'Elena', lastName: 'Rodriguez', position: 'Senior Scientist', institution: 'Johns Hopkins University' },
      { firstName: 'James', lastName: 'Wilson', position: 'Research Director', institution: 'National Renewable Energy Laboratory' },
      { firstName: 'Marcus', lastName: 'Johnson', position: 'Principal Investigator', institution: 'Harvard Medical School' },
      { firstName: 'Priya', lastName: 'Patel', position: 'Assistant Professor', institution: 'Caltech' },
      { firstName: 'Sarah', lastName: 'Chen', position: 'Senior Research Scientist', institution: 'MIT AI Lab' }
    ];
    
    console.log('\n🗑️  Removing specified users...\n');
    
    let removedCount = 0;
    
    for (const userToRemove of usersToRemove) {
      const user = await User.findOne({
        where: {
          firstName: userToRemove.firstName,
          lastName: userToRemove.lastName
        }
      });
      
      if (user) {
        console.log(`Removing: ${user.firstName} ${user.lastName} (ID: ${user.id})`);
        await user.destroy();
        removedCount++;
      } else {
        console.log(`User not found: ${userToRemove.firstName} ${userToRemove.lastName}`);
      }
    }
    
    console.log(`\n✅ Removed ${removedCount} users successfully!`);
    
    // Show remaining users
    console.log('\n📋 Remaining users:');
    const remainingUsers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'position', 'institution']
    });
    
    remainingUsers.forEach(u => {
      console.log(`${u.id}: ${u.firstName} ${u.lastName} - ${u.position || 'No position'} at ${u.institution || 'No institution'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

removeUsers(); 