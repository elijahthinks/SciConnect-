const { DataTypes } = require('sequelize');

async function up({ context: queryInterface }) {
  await queryInterface.sequelize.query(`
    CREATE TABLE IF NOT EXISTS Reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'like',
      targetType TEXT NOT NULL,
      targetId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);

  // Add indexes
  await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS reactions_user_id ON Reactions (userId)');
  await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS reactions_target ON Reactions (targetType, targetId)');
  await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS reactions_unique_user_target ON Reactions (userId, targetType, targetId)');
}

async function down({ context: queryInterface }) {
  await queryInterface.sequelize.query('DROP TABLE IF EXISTS Reactions');
}

module.exports = { up, down }; 