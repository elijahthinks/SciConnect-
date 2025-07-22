require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// SQLite connection (source)
const sqliteDb = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false,
});

// PostgreSQL connection (destination)
let postgresDb = null;

const initPostgresDb = () => {
  const postgresUrl = process.env.POSTGRES_URL;
  
  if (!postgresUrl) {
    console.error('❌ POSTGRES_URL environment variable is required');
    console.log('Please set POSTGRES_URL in your .env file, for example:');
    console.log('POSTGRES_URL=postgresql://username:password@localhost:5432/sciconnect');
    process.exit(1);
  }
  
  postgresDb = new Sequelize(postgresUrl, {
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    }
  });
  
  return postgresDb;
};

// Define models for both databases
const defineModels = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: true },
    avatar: { type: DataTypes.STRING, allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    institution: { type: DataTypes.STRING, allowNull: true },
    position: { type: DataTypes.STRING, allowNull: true },
    department: { type: DataTypes.STRING, allowNull: true },
    education: { type: DataTypes.TEXT, allowNull: true, defaultValue: '[]' },
    publications: { type: DataTypes.TEXT, allowNull: true, defaultValue: '[]' },
    researchInterests: { type: DataTypes.TEXT, allowNull: true, defaultValue: '[]' },
    socialLinks: { type: DataTypes.TEXT, allowNull: true, defaultValue: '{}' },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    lastActive: { type: DataTypes.DATE, allowNull: true },
    // New auth fields
    googleId: { type: DataTypes.STRING, allowNull: true },
    facebookId: { type: DataTypes.STRING, allowNull: true },
    provider: { type: DataTypes.ENUM('local', 'google', 'facebook'), defaultValue: 'local' },
    emailVerificationToken: { type: DataTypes.STRING, allowNull: true },
    emailVerificationExpires: { type: DataTypes.DATE, allowNull: true },
    isEmailVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    passwordResetToken: { type: DataTypes.STRING, allowNull: true },
    passwordResetExpires: { type: DataTypes.DATE, allowNull: true },
    refreshToken: { type: DataTypes.TEXT, allowNull: true },
    refreshTokenExpires: { type: DataTypes.DATE, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    loginAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
    lockUntil: { type: DataTypes.DATE, allowNull: true },
  }, { timestamps: true });

  const Post = sequelize.define('Post', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    media: { type: DataTypes.TEXT, allowNull: true, defaultValue: '[]' },
    mediaType: { type: DataTypes.STRING, allowNull: true },
    likes: { type: DataTypes.TEXT, defaultValue: '[]' },
    comments: { type: DataTypes.INTEGER, defaultValue: 0 },
    shares: { type: DataTypes.INTEGER, defaultValue: 0 },
    visibility: { type: DataTypes.STRING, defaultValue: 'public' },
    tags: { type: DataTypes.TEXT, defaultValue: '[]' },
    userId: { type: DataTypes.INTEGER, allowNull: false }
  }, { timestamps: true });

  const Comment = sequelize.define('Comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    parentId: { type: DataTypes.INTEGER, allowNull: true },
    postId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false }
  }, { timestamps: true });

  const Conversation = sequelize.define('Conversation', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    conversationId: { type: DataTypes.STRING, allowNull: false, unique: true },
    participant1Id: { type: DataTypes.INTEGER, allowNull: false },
    participant2Id: { type: DataTypes.INTEGER, allowNull: false },
    lastMessageId: { type: DataTypes.INTEGER, allowNull: true },
    lastMessageAt: { type: DataTypes.DATE, allowNull: true },
    unreadCount1: { type: DataTypes.INTEGER, defaultValue: 0 },
    unreadCount2: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, { timestamps: true });

  const Message = sequelize.define('Message', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    conversationId: { type: DataTypes.STRING, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    receiverId: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    messageType: { type: DataTypes.ENUM('text', 'image', 'video', 'file'), defaultValue: 'text' },
    mediaUrl: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM('sending', 'sent', 'delivered', 'read', 'failed'), defaultValue: 'sending' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    readAt: { type: DataTypes.DATE, allowNull: true },
    retryCount: { type: DataTypes.INTEGER, defaultValue: 0 },
    error: { type: DataTypes.TEXT, allowNull: true }
  }, { timestamps: true });

  const UserRelationship = sequelize.define('UserRelationship', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    followerId: { type: DataTypes.INTEGER, allowNull: false },
    followingId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'accepted', 'blocked'), defaultValue: 'accepted' }
  }, { timestamps: true });

  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.ENUM('follow', 'like', 'comment'), allowNull: false },
    content: { type: DataTypes.STRING, allowNull: false },
    read: { type: DataTypes.BOOLEAN, defaultValue: false },
    relatedModelId: { type: DataTypes.INTEGER, allowNull: true },
    relatedModelType: { type: DataTypes.STRING, allowNull: true },
    recipientId: { type: DataTypes.INTEGER, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: true }
  }, { timestamps: true });

  const Reaction = sequelize.define('Reaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'like' },
    targetType: { type: DataTypes.STRING, allowNull: false },
    targetId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false }
  }, { timestamps: true });

  return {
    User,
    Post, 
    Comment,
    Conversation,
    Message,
    UserRelationship,
    Notification,
    Reaction
  };
};

const migrateTable = async (TableSQLite, TablePostgres, tableName) => {
  console.log(`📦 Migrating ${tableName}...`);
  
  try {
    // Get all data from SQLite
    const data = await TableSQLite.findAll({ raw: true });
    
    if (data.length === 0) {
      console.log(`   ℹ️  No data found in ${tableName}`);
      return { migrated: 0, errors: 0 };
    }

    let migrated = 0;
    let errors = 0;

    // Insert data in batches
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        await TablePostgres.bulkCreate(batch, {
          ignoreDuplicates: true,
          updateOnDuplicate: Object.keys(batch[0] || {}).filter(key => key !== 'id')
        });
        migrated += batch.length;
        console.log(`   ✅ Migrated ${migrated}/${data.length} records`);
      } catch (error) {
        console.error(`   ❌ Error migrating batch: ${error.message}`);
        
        // Try individual inserts for failed batch
        for (const record of batch) {
          try {
            await TablePostgres.create(record);
            migrated++;
          } catch (individualError) {
            console.error(`   ❌ Failed to migrate record ${record.id}: ${individualError.message}`);
            errors++;
          }
        }
      }
    }

    console.log(`   ✅ ${tableName}: ${migrated} migrated, ${errors} errors`);
    return { migrated, errors };
  } catch (error) {
    console.error(`   ❌ Failed to migrate ${tableName}: ${error.message}`);
    return { migrated: 0, errors: 1 };
  }
};

const main = async () => {
  console.log('🚀 Starting SciConnect Data Migration: SQLite → PostgreSQL\n');

  try {
    // Initialize databases
    console.log('📊 Initializing database connections...');
    initPostgresDb();

    // Test connections
    await sqliteDb.authenticate();
    console.log('✅ SQLite connection established');

    await postgresDb.authenticate();
    console.log('✅ PostgreSQL connection established\n');

    // Define models
    const sqliteModels = defineModels(sqliteDb);
    const postgresModels = defineModels(postgresDb);

    // Sync PostgreSQL database (create tables)
    console.log('🏗️  Creating PostgreSQL tables...');
    await postgresDb.sync({ force: false, alter: true });
    console.log('✅ PostgreSQL tables ready\n');

    // Migration order (respecting foreign key dependencies)
    const migrationPlan = [
      { sqlite: sqliteModels.User, postgres: postgresModels.User, name: 'Users' },
      { sqlite: sqliteModels.Post, postgres: postgresModels.Post, name: 'Posts' },
      { sqlite: sqliteModels.Comment, postgres: postgresModels.Comment, name: 'Comments' },
      { sqlite: sqliteModels.Conversation, postgres: postgresModels.Conversation, name: 'Conversations' },
      { sqlite: sqliteModels.Message, postgres: postgresModels.Message, name: 'Messages' },
      { sqlite: sqliteModels.UserRelationship, postgres: postgresModels.UserRelationship, name: 'UserRelationships' },
      { sqlite: sqliteModels.Notification, postgres: postgresModels.Notification, name: 'Notifications' },
      { sqlite: sqliteModels.Reaction, postgres: postgresModels.Reaction, name: 'Reactions' }
    ];

    let totalMigrated = 0;
    let totalErrors = 0;

    // Execute migration
    for (const { sqlite, postgres, name } of migrationPlan) {
      const result = await migrateTable(sqlite, postgres, name);
      totalMigrated += result.migrated;
      totalErrors += result.errors;
    }

    console.log('\n🎉 Migration Complete!');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Total records migrated: ${totalMigrated}`);
    console.log(`   ❌ Total errors: ${totalErrors}`);

    if (totalErrors === 0) {
      console.log('\n✨ Migration successful! Your PostgreSQL database is ready.');
      console.log('💡 Next steps:');
      console.log('   1. Update your .env file to use POSTGRES_URL');
      console.log('   2. Restart your application');
      console.log('   3. Backup your SQLite database for safety');
    } else {
      console.log('\n⚠️  Migration completed with some errors. Please review the logs above.');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    // Close connections
    try {
      await sqliteDb.close();
      await postgresDb.close();
      console.log('\n🔌 Database connections closed');
    } catch (error) {
      console.error('Error closing connections:', error);
    }
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Migration interrupted by user');
  try {
    await sqliteDb.close();
    await postgresDb.close();
  } catch (error) {
    // Ignore close errors during interrupt
  }
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

// Run migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, migrateTable }; 