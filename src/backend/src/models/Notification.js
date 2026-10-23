const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('follow', 'like', 'comment', 'reaction', 'message', 'group_invite', 'group_message'),
    allowNull: false
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  relatedModelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID of the related model (post, comment, etc.)'
  },
  relatedModelType: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Type of the related model (Post, Comment, etc.)'
  }
});

// Relationships
Notification.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });
Notification.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

module.exports = Notification; 