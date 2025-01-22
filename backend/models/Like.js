const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'likes',
  indexes: [
    {
      unique: true,
      fields: ['post_id', 'user_id']
    }
  ]
});

module.exports = Like; 