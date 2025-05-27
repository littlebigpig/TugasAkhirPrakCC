import Session from "../models/session.model.js";
import Computer from "../models/computer.model.js";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";

const SessionController = {
  // Mulai sesi baru
  startSession: async (req, res) => {
    const { user_id, computer_id, duration, username } = req.body;

    if (!user_id || !computer_id || !duration) {
      return res
        .status(400)
        .json({ message: "user_id, computer_id, dan duration wajib diisi" });
    }

    try {
      // Cek komputer status
      const computer = await Computer.findByPk(computer_id);
      if (!computer)
        return res.status(404).json({ message: "Komputer tidak ditemukan" });
      if (computer.status !== "available") {
        return res
          .status(400)
          .json({ message: "Komputer sedang tidak tersedia" });
      }

      // Hitung biaya
      const cost = duration * 5000; // tarif Rp5000 per jam

      // Ambil user username untuk simpan ke session.computer_number
      const user = await User.findByPk(user_id);
      if (!user)
        return res.status(404).json({ message: "User tidak ditemukan" });

      // Buat session baru
      const session = await Session.create({
        user_id,
        computer_number: computer.name,
        computer_id,
        start_time: new Date(),
        duration,
        cost,
        status: "ongoing",
      });

      // Update status komputer jadi 'in_use'
      computer.status = "in_use";
      await computer.save();

      const transaction = await Transaction.create({
        session_id: session.id,
        total_payment: cost,
        payment_method: req.body.payment_method || "offline",
        username: username || "Guest", // Save the username to transaction
        pcnumber: computer.name, // Save the PC number
        duration: duration // Save the duration
      });

      res.status(201).json({ message: "Sesi baru dimulai", session });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Gagal memulai sesi", error: error.message });
    }
  },

  // List semua sesi (admin)
  getAllSessions: async (req, res) => {
    try {
      const sessions = await Session.findAll({ include: [User, Computer] });
      res.json(sessions);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Gagal mengambil sesi", error: error.message });
    }
  },

  // Selesaikan sesi (update end_time dan status, dan ubah status komputer)
  finishSession: async (req, res) => {
    const { id } = req.params;

    try {
      const session = await Session.findByPk(id);
      if (!session)
        return res.status(404).json({ message: "Sesi tidak ditemukan" });
      if (session.status === "finished") {
        return res.status(400).json({ message: "Sesi sudah selesai" });
      }

      session.end_time = new Date();
      session.status = "finished";
      await session.save();

      // Update komputer status ke available
      const computer = await Computer.findByPk(session.computer_id);
      if (computer) {
        computer.status = "available";
        await computer.save();
      }

      res.json({ message: "Sesi berhasil diselesaikan", session });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Gagal menyelesaikan sesi", error: error.message });
    }
  },
};

export default SessionController;
