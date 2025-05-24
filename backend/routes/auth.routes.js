const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Register
router.post('/register', AuthController.register);

// Login
router.post('/login', AuthController.login);

// Logout (opsional, tergantung implementasi refresh token/session)
router.post('/logout', AuthController.logout);

// Verifikasi Token
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `Halo ${req.user.id}, kamu sudah login!` });
});

module.exports = router;
