const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  media: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('media');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('media', JSON.stringify(value || []));
    }
  },
  mediaType: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['image', 'video', 'document']]
    }
  },
  likes: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('likes');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('likes', JSON.stringify(value || []));
    }
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  visibility: {
    type: DataTypes.STRING,
    defaultValue: 'public',
    validate: {
      isIn: [['public', 'connections', 'private']]
    }
  },
  tags: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('tags');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value || []));
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['createdAt']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['visibility']
    }
  ]
});

// Define relationships
Post.belongsTo(User, { as: 'author', foreignKey: 'userId' });
User.hasMany(Post, { as: 'posts', foreignKey: 'userId' });

module.exports = Post; 