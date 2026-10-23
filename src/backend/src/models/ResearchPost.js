const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const ResearchPost = sequelize.define('ResearchPost', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Inherit from regular Post
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
  },
  
  // Research-specific fields
  researchType: {
    type: DataTypes.ENUM('experiment', 'survey', 'review', 'case_study', 'theoretical', 'methodology', 'results', 'discussion'),
    allowNull: false,
    defaultValue: 'results'
  },
  methodology: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Detailed methodology description'
  },
  results: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Key findings and results'
  },
  conclusions: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Conclusions and implications'
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
    },
    comment: 'Array of citation objects with DOI, title, authors, etc.'
  },
  doi: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Digital Object Identifier if published'
  },
  preprintUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Link to preprint if available'
  },
  openAccess: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the research is open access'
  },
  funding: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Funding sources and acknowledgments'
  },
  conflictsOfInterest: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Declared conflicts of interest'
  },
  
  // Fact-checking and community verification
  factCheckStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'flagged', 'disputed'),
    defaultValue: 'pending'
  },
  factCheckScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 1
    }
  },
  factCheckNotes: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('factCheckNotes');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('factCheckNotes', JSON.stringify(value || []));
    },
    comment: 'Community fact-checking notes and corrections'
  },
  
  // Engagement metrics
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
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  
  // Collaboration features
  collaborationStatus: {
    type: DataTypes.ENUM('open', 'invite_only', 'closed'),
    defaultValue: 'open'
  },
  collaborators: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('collaborators');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('collaborators', JSON.stringify(value || []));
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
      fields: ['researchType']
    },
    {
      fields: ['factCheckStatus']
    },
    {
      fields: ['openAccess']
    }
  ]
});

// Define relationships
ResearchPost.belongsTo(User, { as: 'author', foreignKey: 'userId' });
User.hasMany(ResearchPost, { as: 'researchPosts', foreignKey: 'userId' });

module.exports = ResearchPost; 