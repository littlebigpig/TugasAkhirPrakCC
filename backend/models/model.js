const Sequelize = require('sequelize');
const db = require('../config/database');

// Import semua model
const User = require('./user.model');
// Nanti kita tambahkan model lain di sini juga, seperti:
// const Session = require('./session.model');
// const Computer = require('./computer.model');

// Object untuk menyimpan semua model
const dbModels = {
  Sequelize,
  sequelize: db,
  User,
  // Session,
  // Computer,
};

module.exports = dbModels;
