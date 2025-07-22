const bcrypt = require('bcrypt');
const User = require('../models/User');
const sequelize = require('../db');

async function resetUser() {
  try {
    const email = 'elijahdalton908@gmail.com';
    const newPassword = 'password123';
    const hash = await bcrypt.hash(newPassword, 12);

    await sequelize.sync();
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error('❌ User not found for email:', email);
      process.exit(1);
    }

    user.password = hash;
    user.provider = 'local';
    user.isActive = true;
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.isEmailVerified = true;
    await user.save();

    console.log('✅ User reset successfully!');
    console.log('You can now log in with:');
    console.log('  Email:', email);
    console.log('  Password: password123');
  } catch (err) {
    console.error('❌ Error resetting user:', err);
  } finally {
    await sequelize.close();
  }
}

resetUser(); 