const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'categories'
});

// Self-referential relationship
Category.belongsTo(Category, { 
  as: 'parent', 
  foreignKey: 'parent_id',
  onDelete: 'CASCADE'
});

Category.hasMany(Category, { 
  as: 'children', 
  foreignKey: 'parent_id',
  onDelete: 'CASCADE'
});

module.exports = Category;
