const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const GroupChat = require('./GroupChat');

const GroupMessage = sequelize.define('GroupMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  groupChatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: GroupChat,
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true, // Can be null for media-only messages
  },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'video', 'file', 'system', 'announcement'),
    defaultValue: 'text',
    allowNull: false
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mediaType: {
    type: DataTypes.STRING,
    allowNull: true, // MIME type for media files
  },
  mediaSize: {
    type: DataTypes.INTEGER,
    allowNull: true, // File size in bytes
  },
  mediaMetadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('mediaMetadata');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('mediaMetadata', JSON.stringify(value));
    }
  },
  // Message status and delivery
  status: {
    type: DataTypes.ENUM('sending', 'sent', 'delivered', 'failed'),
    defaultValue: 'sending',
    allowNull: false
  },
  deliveredTo: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('deliveredTo');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('deliveredTo', JSON.stringify(value || []));
    }
  },
  readBy: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('readBy');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('readBy', JSON.stringify(value || []));
    }
  },
  // Reply functionality
  replyToMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'GroupMessage',
      key: 'id'
    }
  },
  // Reactions
  reactions: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('reactions');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('reactions', JSON.stringify(value || {}));
    }
  },
  // Message flags
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  pinnedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  pinnedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deletedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  // Mentions
  mentions: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('mentions');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('mentions', JSON.stringify(value || []));
    }
  },
  // System message data
  systemData: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('systemData');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('systemData', JSON.stringify(value || {}));
    }
  },
  // Thread functionality
  threadReplies: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  lastReplyAt: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
  paranoid: true, // Soft delete support
  indexes: [
    {
      fields: ['groupChatId', 'createdAt']
    },
    {
      fields: ['senderId']
    },
    {
      fields: ['messageType']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isPinned']
    },
    {
      fields: ['replyToMessageId']
    },
    {
      fields: ['isDeleted']
    }
  ]
});

// Instance methods
GroupMessage.prototype.addReaction = async function(userId, reaction) {
  const reactions = this.reactions;
  if (!reactions[reaction]) {
    reactions[reaction] = [];
  }
  
  // Remove user from other reactions
  Object.keys(reactions).forEach(key => {
    reactions[key] = reactions[key].filter(id => id !== userId);
  });
  
  // Add user to new reaction
  if (!reactions[reaction].includes(userId)) {
    reactions[reaction].push(userId);
  }
  
  // Clean up empty reactions
  Object.keys(reactions).forEach(key => {
    if (reactions[key].length === 0) {
      delete reactions[key];
    }
  });
  
  await this.update({ reactions });
};

GroupMessage.prototype.removeReaction = async function(userId, reaction) {
  const reactions = this.reactions;
  if (reactions[reaction]) {
    reactions[reaction] = reactions[reaction].filter(id => id !== userId);
    if (reactions[reaction].length === 0) {
      delete reactions[reaction];
    }
    await this.update({ reactions });
  }
};

GroupMessage.prototype.markAsRead = async function(userId) {
  const readBy = this.readBy;
  if (!readBy.some(read => read.userId === userId)) {
    readBy.push({
      userId,
      readAt: new Date()
    });
    await this.update({ readBy });
  }
};

GroupMessage.prototype.markAsDelivered = async function(userId) {
  const deliveredTo = this.deliveredTo;
  if (!deliveredTo.includes(userId)) {
    deliveredTo.push(userId);
    await this.update({ deliveredTo });
  }
};

// Define relationships
GroupMessage.belongsTo(GroupChat, { as: 'groupChat', foreignKey: 'groupChatId' });
GroupMessage.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
GroupMessage.belongsTo(User, { as: 'pinner', foreignKey: 'pinnedBy' });
GroupMessage.belongsTo(User, { as: 'deleter', foreignKey: 'deletedBy' });
GroupMessage.belongsTo(GroupMessage, { as: 'replyTo', foreignKey: 'replyToMessageId' });

GroupChat.hasMany(GroupMessage, { as: 'messages', foreignKey: 'groupChatId' });
User.hasMany(GroupMessage, { as: 'sentGroupMessages', foreignKey: 'senderId' });
GroupMessage.hasMany(GroupMessage, { as: 'replies', foreignKey: 'replyToMessageId' });

module.exports = GroupMessage; 