const { DataTypes } = require('sequelize');

async function up({ context: queryInterface }) {
  const t = await queryInterface.sequelize.transaction();
  
  try {
    // Check if columns already exist before adding them
    const tableInfo = await queryInterface.describeTable('Users');
    
    // Add userType field
    if (!tableInfo.userType) {
      await queryInterface.addColumn('Users', 'userType', {
        type: DataTypes.ENUM('academic', 'hobbyist', 'independent', 'student', 'professional'),
        defaultValue: 'academic',
        allowNull: false
      }, { transaction: t });
    }
    
    // Add badges field
    if (!tableInfo.badges) {
      await queryInterface.addColumn('Users', 'badges', {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]'
      }, { transaction: t });
    }
    
    // Add skillTags field
    if (!tableInfo.skillTags) {
      await queryInterface.addColumn('Users', 'skillTags', {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]'
      }, { transaction: t });
    }
    
    // Add sideProjects field
    if (!tableInfo.sideProjects) {
      await queryInterface.addColumn('Users', 'sideProjects', {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '[]'
      }, { transaction: t });
    }
    
    await t.commit();
    console.log('Open-access profile fields added successfully');
  } catch (error) {
    await t.rollback();
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down({ context: queryInterface }) {
  const t = await queryInterface.sequelize.transaction();
  
  try {
    // Remove the new columns
    await queryInterface.removeColumn('Users', 'userType', { transaction: t });
    await queryInterface.removeColumn('Users', 'badges', { transaction: t });
    await queryInterface.removeColumn('Users', 'skillTags', { transaction: t });
    await queryInterface.removeColumn('Users', 'sideProjects', { transaction: t });
    
    await t.commit();
    console.log('Open-access profile fields removed successfully');
  } catch (error) {
    await t.rollback();
    console.error('Migration rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down }; 