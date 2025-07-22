const { Sequelize } = require('sequelize');
const path = require('path');
const config = require('./config')[process.env.NODE_ENV || 'development'];

let sequelize;

// Use PostgreSQL if configured, otherwise fallback to SQLite
if (config.database.postgres) {
  console.log('🐘 Using PostgreSQL database');
  sequelize = new Sequelize(config.database.postgres, {
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