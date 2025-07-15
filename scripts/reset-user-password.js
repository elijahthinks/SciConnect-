const sequelize = require('../db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function resetUser() {
  try {
    await sequelize.authenticate();
    const email = 'elijahdalton908@gmail.com';
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return;
    }
    const newPassword = 'password123';
    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    user.isActive = true;
    user.isEmailVerified = true;
    await user.save();
    console.log('✅ User reset complete. You can now log in with:');
    console.log('Email:', email);
    console.log('Password:', newPassword);
  } catch (err) {
    console.error('Error resetting user:', err);
  } finally {
    await sequelize.close();
  }
}

resetUser(); 