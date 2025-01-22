const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  media_type: {
    type: DataTypes.ENUM('text', 'image', 'video'),
    defaultValue: 'text',
  },
  media_url: {
    type: DataTypes.STRING,
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public',
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'posts'
});

module.exports = Post; 