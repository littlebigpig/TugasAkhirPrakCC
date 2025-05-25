import express from 'express';
import ComputerController from '../controllers/computer.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

// Semua route butuh token (admin)
router.use(verifyToken);

// Get semua komputer
router.get('/', ComputerController.getAllComputers);

// Update status komputer
router.patch('/:id/status', ComputerController.updateStatus);

// Tambah komputer baru
router.post('/', ComputerController.addComputer);

export default router;
