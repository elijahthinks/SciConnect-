const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const UserRelationship = sequelize.define('UserRelationship', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
    defaultValue: 'accepted'
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['followerId', 'followingId']
    }
  ]
});

// Define relationships
User.belongsToMany(User, {
  through: UserRelationship,
  as: 'followers',
  foreignKey: 'followingId',
  otherKey: 'followerId'
});

User.belongsToMany(User, {
  through: UserRelationship,
  as: 'following',
  foreignKey: 'followerId',
  otherKey: 'followingId'
});

module.exports = UserRelationship; 