import express from 'express';
import TransactionController from '../controllers/transaction.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';
import checkAdmin from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(verifyToken);

// Buat transaksi baru
router.post('/', TransactionController.createTransaction); // Create

// Read transaksi berdasarkan ID
router.get('/:id', verifyToken, TransactionController.getTransactionById); // Read

// Update transaksi
router.patch('/:id', checkAdmin, TransactionController.updateTransaction); // Update

// Hapus transaksi
router.delete('/:id', checkAdmin, TransactionController.deleteTransaction); // Delete

export default router;
