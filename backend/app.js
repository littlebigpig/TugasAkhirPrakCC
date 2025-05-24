const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth.routes');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Routes
app.get('/', (req, res) => {
  res.send('API Warnet siap digunakan!');
});

// Tambahkan route lain di sini nanti
// Contoh: app.use('/api/auth', require('./routes/auth.routes'));

module.exports = app;
