const { DataTypes } = require('sequelize');

async function up({ context: queryInterface }) {
  // Add new fields to User table
  await queryInterface.sequelize.query('ALTER TABLE Users ADD COLUMN bio TEXT');
  await queryInterface.sequelize.query('ALTER TABLE Users ADD COLUMN education TEXT');
  await queryInterface.sequelize.query('ALTER TABLE Users ADD COLUMN research_interests TEXT');
  await queryInterface.sequelize.query('ALTER TABLE Users ADD COLUMN social_links TEXT DEFAULT \'[]\'');

  // Add new fields to Post table
  await queryInterface.sequelize.query('ALTER TABLE Posts ADD COLUMN visibility TEXT DEFAULT \'public\' NOT NULL');
  await queryInterface.sequelize.query('ALTER TABLE Posts ADD COLUMN tags TEXT DEFAULT \'[]\' NOT NULL');
  await queryInterface.sequelize.query('ALTER TABLE Posts ADD COLUMN shares INTEGER DEFAULT 0 NOT NULL');

  // Create indexes
  await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS posts_created_at ON Posts (createdAt)');
  await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS posts_user_id ON Posts (userId)');
  await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS posts_visibility ON Posts (visibility)');
}

async function down({ context: queryInterface }) {
  // Remove fields from User table
  await queryInterface.sequelize.query(`
    CREATE TABLE Users_temp AS 
    SELECT id, username, email, password, name, avatar_url, createdAt, updatedAt 
    FROM Users;
    DROP TABLE Users;
    ALTER TABLE Users_temp RENAME TO Users;
  `);

  // Remove fields from Post table
  await queryInterface.sequelize.query(`
    CREATE TABLE Posts_temp AS 
    SELECT id, userId, content, media_url, createdAt, updatedAt 
    FROM Posts;
    DROP TABLE Posts;
    ALTER TABLE Posts_temp RENAME TO Posts;
  `);

  // Remove indexes (they will be removed with the table drop)
}

module.exports = { up, down }; 