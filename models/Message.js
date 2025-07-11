const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  conversationId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'video', 'file'),
    defaultValue: 'text',
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('sending', 'sent', 'delivered', 'read', 'failed'),
    defaultValue: 'sending',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: true,
});

// Define relationships
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

module.exports = Message; 