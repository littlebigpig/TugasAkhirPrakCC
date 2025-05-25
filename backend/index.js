import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import computerRoutes from './routes/computer.routes.js';
import sessionRoutes from './routes/session.routes.js';
import transactionRoutes from './routes/transaction.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/computers', computerRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.send('API Warnet siap digunakan!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
