const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const GroupChat = sequelize.define('GroupChat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('public', 'private', 'research_group', 'study_group'),
    defaultValue: 'private',
    allowNull: false
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
    validate: {
      min: 2,
      max: 500
    }
  },
  currentMemberCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  settings: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('settings');
      return value ? JSON.parse(value) : {
        allowMediaSharing: true,
        allowMemberInvites: true,
        muteNotifications: false,
        requireApproval: false,
        allowFileSharing: true,
        maxFileSize: 50 // MB
      };
    },
    set(value) {
      this.setDataValue('settings', JSON.stringify(value));
    }
  },
  lastActivity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  lastMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('tags');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('tags', JSON.stringify(value || []));
    }
  },
  // Research-specific fields
  researchArea: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  // Creator/Admin
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['type']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['lastActivity']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['researchArea']
    }
  ]
});

// Define relationships
GroupChat.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
User.hasMany(GroupChat, { as: 'createdGroups', foreignKey: 'createdBy' });

module.exports = GroupChat; 