const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const ResearchPost = require('./ResearchPost');

const Collaboration = sequelize.define('Collaboration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  researchPostId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ResearchPost,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('lead', 'co_author', 'contributor', 'reviewer', 'advisor'),
    allowNull: false,
    defaultValue: 'contributor'
  },
  status: {
    type: DataTypes.ENUM('invited', 'accepted', 'declined', 'pending'),
    defaultValue: 'invited'
  },
  contribution: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description of the user\'s contribution to the research'
  },
  expertise: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('expertise');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('expertise', JSON.stringify(value || []));
    },
    comment: 'Areas of expertise relevant to this collaboration'
  },
  permissions: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('permissions');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('permissions', JSON.stringify(value || []));
    },
    comment: 'Permissions for editing, commenting, etc.'
  },
  invitedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  invitedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['researchPostId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['role']
    }
  ]
});

// Define relationships
Collaboration.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Collaboration.belongsTo(ResearchPost, { as: 'researchPost', foreignKey: 'researchPostId' });
Collaboration.belongsTo(User, { as: 'inviter', foreignKey: 'invitedBy' });

User.hasMany(Collaboration, { as: 'collaborations', foreignKey: 'userId' });
ResearchPost.hasMany(Collaboration, { as: 'collaborations', foreignKey: 'researchPostId' });

module.exports = Collaboration; 