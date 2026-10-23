const { DataTypes } = require('sequelize');

async function up({ context: queryInterface }) {
  const t = await queryInterface.sequelize.transaction();
  
  try {
    // Check if columns already exist before adding them
    const tableInfo = await queryInterface.describeTable('Users');
    
    // Add OAuth fields
    if (!tableInfo.googleId) {
      await queryInterface.addColumn('Users', 'googleId', {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      }, { transaction: t });
    }
    
    if (!tableInfo.facebookId) {
      await queryInterface.addColumn('Users', 'facebookId', {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      }, { transaction: t });
    }
    
    if (!tableInfo.provider) {
      await queryInterface.addColumn('Users', 'provider', {
        type: DataTypes.ENUM('local', 'google', 'facebook'),
        defaultValue: 'local',
        allowNull: false
      }, { transaction: t });
    }
    
    // Add email verification fields
    if (!tableInfo.emailVerificationToken) {
      await queryInterface.addColumn('Users', 'emailVerificationToken', {
        type: DataTypes.STRING,
        allowNull: true
      }, { transaction: t });
    }
    
    if (!tableInfo.emailVerificationExpires) {
      await queryInterface.addColumn('Users', 'emailVerificationExpires', {
        type: DataTypes.DATE,
        allowNull: true
      }, { transaction: t });
    }
    
    if (!tableInfo.isEmailVerified) {
      await queryInterface.addColumn('Users', 'isEmailVerified', {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      }, { transaction: t });
    }
    
    // Add password reset fields
    if (!tableInfo.passwordResetToken) {
      await queryInterface.addColumn('Users', 'passwordResetToken', {
        type: DataTypes.STRING,
        allowNull: true
      }, { transaction: t });
    }
    
    if (!tableInfo.passwordResetExpires) {
      await queryInterface.addColumn('Users', 'passwordResetExpires', {
        type: DataTypes.DATE,
        allowNull: true
      }, { transaction: t });
    }
    
    // Add refresh token fields
    if (!tableInfo.refreshToken) {
      await queryInterface.addColumn('Users', 'refreshToken', {
        type: DataTypes.TEXT,
        allowNull: true
      }, { transaction: t });
    }
    
    if (!tableInfo.refreshTokenExpires) {
      await queryInterface.addColumn('Users', 'refreshTokenExpires', {
        type: DataTypes.DATE,
        allowNull: true
      }, { transaction: t });
    }
    
    // Add account status fields
    if (!tableInfo.isActive) {
      await queryInterface.addColumn('Users', 'isActive', {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }, { transaction: t });
    }
    
    if (!tableInfo.loginAttempts) {
      await queryInterface.addColumn('Users', 'loginAttempts', {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      }, { transaction: t });
    }
    
    if (!tableInfo.lockUntil) {
      await queryInterface.addColumn('Users', 'lockUntil', {
        type: DataTypes.DATE,
        allowNull: true
      }, { transaction: t });
    }
    
    // Make password nullable for OAuth users
    if (tableInfo.password && tableInfo.password.allowNull === false) {
      await queryInterface.changeColumn('Users', 'password', {
        type: DataTypes.STRING,
        allowNull: true
      }, { transaction: t });
    }
    
    await t.commit();
    console.log('Authentication fields added successfully');
  } catch (error) {
    await t.rollback();
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down({ context: queryInterface }) {
  const t = await queryInterface.sequelize.transaction();
  
  try {
    // Remove added columns
    const tableInfo = await queryInterface.describeTable('Users');
    
    const columnsToRemove = [
      'googleId',
      'facebookId',
      'provider',
      'emailVerificationToken',
      'emailVerificationExpires',
      'isEmailVerified',
      'passwordResetToken',
      'passwordResetExpires',
      'refreshToken',
      'refreshTokenExpires',
      'isActive',
      'loginAttempts',
      'lockUntil'
    ];
    
    for (const column of columnsToRemove) {
      if (tableInfo[column]) {
        await queryInterface.removeColumn('Users', column, { transaction: t });
      }
    }
    
    // Make password non-nullable again
    await queryInterface.changeColumn('Users', 'password', {
      type: DataTypes.STRING,
      allowNull: false
    }, { transaction: t });
    
    await t.commit();
    console.log('Authentication fields removed successfully');
  } catch (error) {
    await t.rollback();
    console.error('Migration rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down }; 