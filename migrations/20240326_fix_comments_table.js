const { DataTypes } = require('sequelize');

async function up({ context: queryInterface }) {
  const t = await queryInterface.sequelize.transaction();
  
  try {
    // Check if columns already exist before adding them
    const tableInfo = await queryInterface.describeTable('Comments');
    
    // Add postId field if it doesn't exist
    if (!tableInfo.postId) {
      await queryInterface.addColumn('Comments', 'postId', {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Posts',
          key: 'id'
        }
      }, { transaction: t });
    }
    
    // Add userId field if it doesn't exist
    if (!tableInfo.userId) {
      await queryInterface.addColumn('Comments', 'userId', {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      }, { transaction: t });
    }
    
    await t.commit();
    console.log('Comments table fields added successfully');
  } catch (error) {
    await t.rollback();
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down({ context: queryInterface }) {
  const t = await queryInterface.sequelize.transaction();
  
  try {
    // Remove the columns
    await queryInterface.removeColumn('Comments', 'postId', { transaction: t });
    await queryInterface.removeColumn('Comments', 'userId', { transaction: t });
    
    await t.commit();
    console.log('Comments table fields removed successfully');
  } catch (error) {
    await t.rollback();
    console.error('Migration rollback failed:', error);
    throw error;
  }
}

module.exports = { up, down }; 