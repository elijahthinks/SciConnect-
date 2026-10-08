const { Sequelize } = require('sequelize');
const path = require('path');
const config = require('./config')[process.env.NODE_ENV || 'development'];

let sequelize;

// Use PostgreSQL if configured, otherwise fallback to SQLite.
// POSTGRES_URL is what Vercel's Postgres/Neon integration sets; DATABASE_URL is
// the common name elsewhere, so accept either (DATABASE_URL defaults to a
// sqlite: URL in development, hence the prefix check).
const postgresUrl = config.database.postgres ||
  (/^postgres(ql)?:/.test(config.database.url || '') ? config.database.url : null);

if (postgresUrl) {
  console.log('🐘 Using PostgreSQL database');
  sequelize = new Sequelize(postgresUrl, {
    dialect: 'postgres',
    // Pass the driver in directly. Sequelize normally loads it by name at
    // runtime, which Vercel's bundler can't see, so it would be left out.
    dialectModule: require('pg'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    define: {
      underscored: false,
      freezeTableName: true,
      charset: 'utf8',
      timestamps: true
    },
    // Retry configuration
    retry: {
      max: 3,
      timeout: 60000,
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ENOTFOUND/,
        /EAI_AGAIN/
      ]
    }
  });
} else {
  // On Vercel only /tmp is writable, and it's wiped whenever Vercel starts a
  // fresh instance. That's fine for a show-only demo (the guest account is
  // recreated automatically), but posts won't stick around. Add a Postgres
  // database (POSTGRES_URL) to keep data.
  const storage = process.env.VERCEL
    ? '/tmp/database.sqlite'
    : path.join(__dirname, 'database.sqlite');
  console.log(`📁 Using SQLite database (fallback) at ${storage}`);
  sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: require('sqlite3'),
  storage,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      underscored: false,
      freezeTableName: true,
      timestamps: true
    }
  });
}

module.exports = sequelize; 