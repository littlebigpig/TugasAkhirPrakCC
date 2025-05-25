import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

// Register route
router.post('/register', AuthController.register);

// Login route
router.post('/login', AuthController.login);

// Logout route
router.post('/logout', verifyToken, AuthController.logout);

// Route protected, contoh tes verifikasi token
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `Halo ${req.user.id}, kamu sudah login!` });
});

export default router;
