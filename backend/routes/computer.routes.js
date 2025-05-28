import express from 'express';
import ComputerController from '../controllers/computer.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import checkAdmin from '../middlewares/role.middleware.js';

const router = express.Router();

// Semua route butuh token (admin)
router.use(verifyToken);

// Get semua komputer
router.get('/', ComputerController.getAllComputers);

// Update status komputer
router.patch('/:id/status', checkAdmin, ComputerController.updateStatus);

// Tambah komputer baru
router.post('/', checkAdmin, ComputerController.createComputer); // Create
router.get('/:id', verifyToken, ComputerController.getComputerById); // Read
router.patch('/:id', checkAdmin, ComputerController.updateComputer); // Update
router.delete('/:id', checkAdmin, ComputerController.deleteComputer); // Delete

export default router;
