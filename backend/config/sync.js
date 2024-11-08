const sequelize = require('./database');
const { User, Post, Comment, Like } = require('../models');

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true }); // Be careful with force: true in production
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = syncDatabase;
