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

  // Create User
  createUser: async (req, res) => {
    try {
      const { username, password, role } = req.body;
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = await User.create({ username, password: hashedPassword, role });
      res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
  },

  // Read User by ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, { attributes: ['id', 'username', 'role'] });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
  },

  // Update User
  updateUser: async (req, res) => {
    try {
      const { username, role } = req.body;
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      await user.update({ username, role });
      res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
  },

  // Delete User
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      await user.destroy();
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
  }
};



export default AuthController;
