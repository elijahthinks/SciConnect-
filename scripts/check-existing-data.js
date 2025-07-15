require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// SQLite connection to check existing data
const sqliteDb = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false,
});

// Define basic models to check data
const defineBasicModels = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
  }, { timestamps: true });

  const Post = sequelize.define('Post', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    content: DataTypes.TEXT,
    userId: DataTypes.INTEGER
  }, { timestamps: true });

  const Comment = sequelize.define('Comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    content: DataTypes.TEXT,
    userId: DataTypes.INTEGER,
    postId: DataTypes.INTEGER
  }, { timestamps: true });

  const Conversation = sequelize.define('Conversation', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    conversationId: DataTypes.STRING,
    participant1Id: DataTypes.INTEGER,
    participant2Id: DataTypes.INTEGER
  }, { timestamps: true });

  const Message = sequelize.define('Message', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    conversationId: DataTypes.STRING,
    senderId: DataTypes.INTEGER,
    receiverId: DataTypes.INTEGER,
    content: DataTypes.TEXT
  }, { timestamps: true });

  return { User, Post, Comment, Conversation, Message };
};

const checkData = async () => {
  console.log('🔍 Checking your existing SciConnect data...\n');

  try {
    await sqliteDb.authenticate();
    console.log('✅ Connected to SQLite database\n');

    const models = defineBasicModels(sqliteDb);

    // Check each table
    const tables = [
      { name: 'Users', model: models.User, icon: '👥' },
      { name: 'Posts', model: models.Post, icon: '📝' },
      { name: 'Comments', model: models.Comment, icon: '💬' },
      { name: 'Conversations', model: models.Conversation, icon: '🗨️' },
      { name: 'Messages', model: models.Message, icon: '✉️' }
    ];

    let totalRecords = 0;
    const summary = [];

    for (const table of tables) {
      try {
        const count = await table.model.count();
        console.log(`${table.icon} ${table.name}: ${count} records`);
        summary.push({ table: table.name, count, icon: table.icon });
        totalRecords += count;

        // Show sample data for non-empty tables
        if (count > 0 && count <= 3) {
          const samples = await table.model.findAll({ limit: 3, raw: true });
          console.log(`   Sample data:`, samples.map(s => ({
            id: s.id,
            ...(s.name && { name: s.name }),
            ...(s.email && { email: s.email }),
            ...(s.content && { content: s.content.substring(0, 50) + '...' }),
            createdAt: s.createdAt
          })));
        }
        console.log('');
      } catch (error) {
        console.log(`${table.icon} ${table.name}: Table doesn't exist or error reading`);
        summary.push({ table: table.name, count: 0, icon: table.icon, error: true });
      }
    }

    console.log('📊 Summary:');
    console.log('═'.repeat(50));
    summary.forEach(({ table, count, icon, error }) => {
      if (error) {
        console.log(`${icon} ${table}: Not found`);
      } else {
        console.log(`${icon} ${table}: ${count} records`);
      }
    });
    console.log('═'.repeat(50));
    console.log(`📈 Total records to migrate: ${totalRecords}`);

    if (totalRecords > 0) {
      console.log('\n✨ Great! You have existing data that will be migrated to PostgreSQL.');
      console.log('\n🚀 Next steps:');
      console.log('   1. Set up PostgreSQL (see SETUP.md)');
      console.log('   2. Configure your .env file with POSTGRES_URL');
      console.log('   3. Run: npm run migrate');
      console.log('   4. All your data will be safely transferred!');
    } else {
      console.log('\n📝 No existing data found. You can start fresh with PostgreSQL!');
      console.log('\n🚀 Next steps:');
      console.log('   1. Set up PostgreSQL (see SETUP.md)');
      console.log('   2. Configure your .env file with POSTGRES_URL');
      console.log('   3. Start using your enhanced SciConnect platform!');
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.log('\n💡 This might be normal if you haven\'t used the app yet.');
  } finally {
    await sqliteDb.close();
  }
};

if (require.main === module) {
  checkData().catch(console.error);
}

module.exports = { checkData }; 