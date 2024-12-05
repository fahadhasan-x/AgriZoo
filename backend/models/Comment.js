const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'comments',
  hooks: {
    beforeCreate: (comment) => {
      comment.created_at = new Date();
      comment.updated_at = new Date();
    },
    beforeUpdate: (comment) => {
      comment.updated_at = new Date();
    }
  }
});

module.exports = Comment;
