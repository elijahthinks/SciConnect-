const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');
const ResearchPost = require('./ResearchPost');

const FactCheck = sequelize.define('FactCheck', {
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
  type: {
    type: DataTypes.ENUM('correction', 'clarification', 'citation', 'methodology_concern', 'result_question', 'general_note'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'The fact-check content/explanation'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'resolved'),
    defaultValue: 'pending'
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  evidence: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Supporting evidence or links'
  },
  citations: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('citations');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('citations', JSON.stringify(value || []));
    }
  },
  votes: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('votes');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('votes', JSON.stringify(value || []));
    },
    comment: 'Array of user votes on this fact-check'
  },
  voteScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Net vote score (upvotes - downvotes)'
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolutionNote: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Note about how the fact-check was resolved'
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
      fields: ['type']
    },
    {
      fields: ['voteScore']
    }
  ]
});

// Define relationships
FactCheck.belongsTo(User, { as: 'author', foreignKey: 'userId' });
FactCheck.belongsTo(ResearchPost, { as: 'researchPost', foreignKey: 'researchPostId' });
FactCheck.belongsTo(User, { as: 'resolver', foreignKey: 'resolvedBy' });

User.hasMany(FactCheck, { as: 'factChecks', foreignKey: 'userId' });
ResearchPost.hasMany(FactCheck, { as: 'factChecks', foreignKey: 'researchPostId' });

module.exports = FactCheck; 