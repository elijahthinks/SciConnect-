const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
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
  }
}, {
  timestamps: true,
});

module.exports = User; 