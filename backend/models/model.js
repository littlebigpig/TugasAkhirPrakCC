import db from '../config/database.js';
import User from './user.model.js';
// Import model lain kalau ada, misal:
// import BillingOption from './billingOption.model.js';
// import Session from './session.model.js';

// Inisialisasi relasi antar model di sini (jika ada), contoh:
// User.hasMany(Session);
// Session.belongsTo(User);

// Export semua model sekaligus agar mudah import di file lain
export {
  db,
  User,
  // BillingOption,
  // Session,
};
