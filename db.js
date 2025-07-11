const { Sequelize } = require('sequelize');
const path = require('path');

const storage = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.join(__dirname, 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

module.exports = sequelize; 