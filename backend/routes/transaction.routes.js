import express from 'express';
import TransactionController from '../controllers/transaction.controller.js';
import verifyToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

// Buat transaksi baru
router.post('/', TransactionController.createTransaction);

// List semua transaksi
router.get('/', TransactionController.getAllTransactions);

export default router;
