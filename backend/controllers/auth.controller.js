import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

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
        role: role || 'user'  // Default to 'user' if role not provided
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

      // Create JWT token and include role in the payload
      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );

      // Send token and role in response
      res.status(200).json({
        message: 'Login berhasil',
        id: user.id,  // Important: Include this!
        username: user.username,
        role: user.role,  // Include role in the response
        accessToken
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Gagal login', error: err.message });
    }
  },

  // LOGOUT
  logout: async (req, res) => {
    return res.status(200).json({ message: 'Logout berhasil (token dihapus di client)' });
  },

  getAllUsers: async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'role'] // Only return necessary fields
        });
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Gagal mengambil data user', error: err.message });
    }
  },

  deleteUser: async (req, res) => {
    const { id } = req.params;

    try {
      const user = await User.findByPk(id);
      if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

      // Prevent deletion of admin user
      if (user.role === 'admin') {
        return res.status(403).json({ message: 'Tidak dapat menghapus user admin' });
      }

      await user.destroy();
      res.status(200).json({ message: 'User berhasil dihapus' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ message: 'Gagal menghapus user', error: err.message });
    }
  }
};



export default AuthController;
