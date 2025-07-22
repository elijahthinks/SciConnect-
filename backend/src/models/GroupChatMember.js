const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const GroupChat = require('./GroupChat');

const GroupChatMember = sequelize.define('GroupChatMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  groupChatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: GroupChat,
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'moderator', 'member'),
    defaultValue: 'member',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'muted', 'banned', 'left'),
    defaultValue: 'active',
    allowNull: false
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  lastReadAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastReadMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  unreadCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  permissions: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('permissions');
      const role = this.getDataValue('role');
      const defaultPermissions = this.getDefaultPermissions(role);
      
      return value ? { ...defaultPermissions, ...JSON.parse(value) } : defaultPermissions;
    },
    set(value) {
      this.setDataValue('permissions', JSON.stringify(value));
    }
  },
  notifications: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('notifications');
      return value ? JSON.parse(value) : {
        enabled: true,
        mentions: true,
        allMessages: false,
        keywords: []
      };
    },
    set(value) {
      this.setDataValue('notifications', JSON.stringify(value));
    }
  },
  // Invitation tracking
  invitedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  inviteAcceptedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Activity tracking
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  messageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  // Custom settings for this member in this group
  customName: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },
  customColor: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'groupChatId']
    },
    {
      fields: ['groupChatId', 'status']
    },
    {
      fields: ['userId', 'status']
    },
    {
      fields: ['role']
    },
    {
      fields: ['lastActive']
    }
  ]
});

// Instance method to get default permissions based on role
GroupChatMember.prototype.getDefaultPermissions = function(role) {
  switch (role) {
    case 'admin':
      return {
        canSendMessages: true,
        canDeleteMessages: true,
        canEditGroupInfo: true,
        canInviteMembers: true,
        canRemoveMembers: true,
        canChangeMemberRoles: true,
        canPinMessages: true,
        canManageSettings: true,
        canDeleteGroup: true
      };
    case 'moderator':
      return {
        canSendMessages: true,
        canDeleteMessages: true,
        canEditGroupInfo: false,
        canInviteMembers: true,
        canRemoveMembers: true,
        canChangeMemberRoles: false,
        canPinMessages: true,
        canManageSettings: false,
        canDeleteGroup: false
      };
    case 'member':
    default:
      return {
        canSendMessages: true,
        canDeleteMessages: false,
        canEditGroupInfo: false,
        canInviteMembers: false,
        canRemoveMembers: false,
        canChangeMemberRoles: false,
        canPinMessages: false,
        canManageSettings: false,
        canDeleteGroup: false
      };
  }
};

// Instance method to check specific permission
GroupChatMember.prototype.hasPermission = function(permission) {
  const permissions = this.permissions;
  return permissions[permission] === true;
};

// Instance method to update last read
GroupChatMember.prototype.markAsRead = async function(messageId) {
  await this.update({
    lastReadAt: new Date(),
    lastReadMessageId: messageId,
    unreadCount: 0
  });
};

// Define relationships
GroupChatMember.belongsTo(User, { as: 'user', foreignKey: 'userId' });
GroupChatMember.belongsTo(GroupChat, { as: 'groupChat', foreignKey: 'groupChatId' });
GroupChatMember.belongsTo(User, { as: 'inviter', foreignKey: 'invitedBy' });

User.hasMany(GroupChatMember, { as: 'groupMemberships', foreignKey: 'userId' });
GroupChat.hasMany(GroupChatMember, { as: 'members', foreignKey: 'groupChatId' });

module.exports = GroupChatMember; 