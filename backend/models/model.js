import db from '../config/database.js';
import User from './user.model.js';
import Computer from './computer.model.js';
import Transaction from './transaction.model.js';
import Session from './session.model.js';

// Inisialisasi relasi antar model di sini (jika ada), contoh:
// User.hasMany(Session);
// Session.belongsTo(User);

// Export semua model sekaligus agar mudah import di file lain
export {
  db,
  User,
  Computer,
  Transaction,
  Session,
};
