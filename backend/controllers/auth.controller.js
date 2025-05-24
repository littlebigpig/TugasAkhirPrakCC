const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const AuthController = {
  // REGISTER
  register: async (req, res) => {
    const { username, password, role } = req.body;
    try {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        username,
        password: hashedPassword,
        role: role || 'user'
      });

      res.status(201).json({ message: 'Registrasi berhasil', user: newUser });
    } catch (err) {
      res.status(500).json({ message: 'Gagal register', error: err.message });
    }
  },

  // LOGIN
  login: async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: 'Password salah' });

      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({ message: 'Login berhasil', accessToken });
    } catch (err) {
      res.status(500).json({ message: 'Gagal login', error: err.message });
    }
  },

  // LOGOUT (optional — bisa lebih kompleks jika pakai refresh token atau session)
  logout: async (req, res) => {
    // Karena JWT stateless, logout bisa di-handle client-side (hapus token dari localStorage)
    return res.status(200).json({ message: 'Logout berhasil (token dihapus di client)' });
  }
};

module.exports = AuthController;
