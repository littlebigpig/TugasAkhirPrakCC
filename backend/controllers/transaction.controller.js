import Transaction from '../models/transaction.model.js';
import Session from '../models/session.model.js';
import User from '../models/user.model.js';
import Computer from '../models/computer.model.js';

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
      console.log('Fetching transactions with associations...');
      
      const transactions = await Transaction.findAll({
        include: [{
          model: Session,
          required: true,
          include: [
            {
              model: User,
              required: true,
              attributes: ['id']
            }
          ]
        }],
        order: [['paid_at', 'DESC']]
      });

      console.log('Raw transactions:', JSON.stringify(transactions, null, 2));

      // Transform data for frontend
      const transformedTransactions = transactions.map(transaction => {
        const session = transaction.Session;
        
        return {
          id: transaction.id,
          user_id: transaction.username || 'Admin',
          computer_number: transaction.pcnumber || 'N/A',
          duration: transaction.duration || 0,
          payment_method: transaction.payment_method,
          paid_at: transaction.paid_at,
          total_payment: transaction.total_payment,
          session_status: session?.status || 'unknown'
        };
      });

      console.log('Transformed transactions:', JSON.stringify(transformedTransactions, null, 2));
      res.json(transformedTransactions);
    } catch (error) {
      console.error('Error in getAllTransactions:', error);
      res.status(500).json({ message: 'Gagal mengambil transaksi', error: error.message });
    }
  },

  // Mengambil transaksi berdasarkan ID
  getTransactionById: async (req, res) => {
    const { id } = req.params;

    try {
      const transaction = await Transaction.findByPk(id, {
        include: [Session] // Sertakan model Session jika diperlukan
      });
      if (!transaction) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: 'Gagal mengambil transaksi', error: error.message });
    }
  },

  // Memperbarui transaksi
  updateTransaction: async (req, res) => {
    const { id } = req.params;
    const { total_payment, payment_method } = req.body;

    try {
      const transaction = await Transaction.findByPk(id);
      if (!transaction) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });

      // Update hanya jika ada nilai baru
      if (total_payment !== undefined) transaction.total_payment = total_payment;
      if (payment_method !== undefined) transaction.payment_method = payment_method;

      await transaction.save();
      res.json({ message: 'Transaksi berhasil diperbarui', transaction });
    } catch (error) {
      res.status(500).json({ message: 'Gagal memperbarui transaksi', error: error.message });
    }
  },

  deleteTransaction: async (req, res) => {
    const { id } = req.params;

    try {
      const transaction = await Transaction.findByPk(id);
      if (!transaction) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });

      await transaction.destroy();
      res.status(200).json({ message: 'Transaksi berhasil dihapus' });
    } catch (error) {
      res.status(500).json({ message: 'Gagal menghapus transaksi', error: error.message });
    }     
  }
};

export default TransactionController;
