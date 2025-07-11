const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const Post = require('./Post');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  timestamps: true,
});

// Associations
Comment.belongsTo(User, { as: 'author', foreignKey: 'userId' });
User.hasMany(Comment, { as: 'comments', foreignKey: 'userId' });

Comment.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(Comment, { as: 'postComments', foreignKey: 'postId' });

Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' });

module.exports = Comment; 