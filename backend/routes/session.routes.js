import express from 'express';
import SessionController from '../controllers/session.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

// Mulai sesi baru
router.post('/', SessionController.startSession);

// List semua sesi
router.get('/', SessionController.getAllSessions);

// Selesaikan sesi
router.patch('/:id/finish', SessionController.finishSession);

export default router;
