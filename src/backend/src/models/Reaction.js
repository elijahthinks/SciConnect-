const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');

const Reaction = sequelize.define('Reaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'like',
    validate: {
      isIn: [['like', 'heart', 'celebrate', 'insightful', 'curious']]
    }
  },
  targetType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['post', 'comment']]
    }
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  indexes: [
    {
      // Ensure unique reactions per user per target
      unique: true,
      fields: ['userId', 'targetType', 'targetId']
    },
    // Index for faster lookups by target
    {
      fields: ['targetType', 'targetId']
    }
  ]
});

// Associations
Reaction.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Reaction, { as: 'reactions', foreignKey: 'userId' });

// Polymorphic associations
Reaction.belongsTo(Post, {
  foreignKey: 'targetId',
  constraints: false,
  scope: {
    targetType: 'post'
  }
});

Reaction.belongsTo(Comment, {
  foreignKey: 'targetId',
  constraints: false,
  scope: {
    targetType: 'comment'
  }
});

Post.hasMany(Reaction, {
  foreignKey: 'targetId',
  constraints: false,
  scope: {
    targetType: 'post'
  },
  as: 'reactions'
});

Comment.hasMany(Reaction, {
  foreignKey: 'targetId',
  constraints: false,
  scope: {
    targetType: 'comment'
  },
  as: 'reactions'
});

module.exports = Reaction; 