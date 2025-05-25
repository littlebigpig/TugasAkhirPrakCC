import Transaction from '../models/transaction.model.js';
import Session from '../models/session.model.js';

const TransactionController = {
  // Buat transaksi baru (biasanya saat sesi mulai)
  createTransaction: async (req, res) => {
    const { session_id, total_payment, payment_method } = req.body;

    if (!session_id || !total_payment || !payment_method) {
      return res.status(400).json({ message: 'session_id, total_payment, dan payment_method wajib diisi' });
    }

    try {
      // Pastikan session ada
      const session = await Session.findByPk(session_id);
      if (!session) return res.status(404).json({ message: 'Session tidak ditemukan' });

      // Buat transaksi
      const transaction = await Transaction.create({
        session_id,
        total_payment,
        payment_method,
      });

      res.status(201).json({ message: 'Transaksi berhasil dibuat', transaction });
    } catch (error) {
      res.status(500).json({ message: 'Gagal membuat transaksi', error: error.message });
    }
  },

  // List semua transaksi (admin)
  getAllTransactions: async (req, res) => {
    try {
      const transactions = await Transaction.findAll({ include: Session });
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Gagal mengambil transaksi', error: error.message });
    }
  },
};

export default TransactionController;
