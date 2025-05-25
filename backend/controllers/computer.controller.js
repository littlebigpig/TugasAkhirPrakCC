import Computer from '../models/computer.model.js';

const ComputerController = {
  // Get semua komputer
  getAllComputers: async (req, res) => {
    try {
      const computers = await Computer.findAll();
      res.json(computers);
    } catch (error) {
      res.status(500).json({ message: 'Gagal mengambil data komputer', error: error.message });
    }
  },

  // Update status komputer (misal maintenance, in_use, available)
  updateStatus: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['available', 'in_use', 'maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Status komputer tidak valid' });
    }

    try {
      const computer = await Computer.findByPk(id);
      if (!computer) return res.status(404).json({ message: 'Komputer tidak ditemukan' });

      computer.status = status;
      await computer.save();

      res.json({ message: 'Status komputer berhasil diupdate', computer });
    } catch (error) {
      res.status(500).json({ message: 'Gagal update status komputer', error: error.message });
    }
  },

  // Optional: tambah komputer baru
  addComputer: async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama komputer wajib diisi' });

    try {
      const newComputer = await Computer.create({ name });
      res.status(201).json({ message: 'Komputer baru berhasil ditambahkan', computer: newComputer });
    } catch (error) {
      res.status(500).json({ message: 'Gagal tambah komputer', error: error.message });
    }
  }
};

export default ComputerController;
