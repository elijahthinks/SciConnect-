const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conversationId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  participant1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  participant2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lastMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  unreadCount1: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  unreadCount2: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
});

// Define relationships
Conversation.belongsTo(User, { as: 'participant1', foreignKey: 'participant1Id' });
Conversation.belongsTo(User, { as: 'participant2', foreignKey: 'participant2Id' });

module.exports = Conversation; 