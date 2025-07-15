const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.firstName} ${this.lastName}`;
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  fieldOfStudy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Allow null for OAuth users
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
  },
  institution: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  // New fields for open-access profiles
  userType: {
    type: DataTypes.ENUM('academic', 'hobbyist', 'independent', 'student', 'professional'),
    defaultValue: 'academic',
    allowNull: false,
  },
  badges: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('badges');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('badges', JSON.stringify(value || []));
    }
  },
  skillTags: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('skillTags');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('skillTags', JSON.stringify(value || []));
    }
  },
  sideProjects: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('sideProjects');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('sideProjects', JSON.stringify(value || []));
    }
  },
  education: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('education');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('education', JSON.stringify(value));
    }
  },
  publications: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('publications');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('publications', JSON.stringify(value));
    }
  },
  researchInterests: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('researchInterests');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('researchInterests', JSON.stringify(value));
    }
  },
  socialLinks: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('socialLinks');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('socialLinks', JSON.stringify(value));
    }
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastActive: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // OAuth fields
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  facebookId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  provider: {
    type: DataTypes.ENUM('local', 'google', 'facebook'),
    defaultValue: 'local',
  },
  // Email verification
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  emailVerificationExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Password reset
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Refresh token
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  refreshTokenExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Account status
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = User; 