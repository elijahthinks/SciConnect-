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
} else if (process.env.VERCEL) {
  // Vercel's filesystem is read-only and wiped between requests, so a SQLite
  // file can't work there. Fail loudly instead of losing data silently.
  throw new Error('POSTGRES_URL (or DATABASE_URL) must be set when running on Vercel');
} else {
  console.log('📁 Using SQLite database (fallback)');
  sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      underscored: false,
      freezeTableName: true,
      timestamps: true
    }
  });
}

module.exports = sequelize; 