import jwt from 'jsonwebtoken';
import cors from 'cors';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer token"

  if (!token) return res.status(401).json({ message: 'Token tidak ditemukan' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid' });

    req.user = user;
    next();
  });
}

app.use(cors({
    origin: ['http://localhost:3000', 'https://projek-fe-870764645625.us-central1.run.app'], // Tambahkan domain frontend Anda
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
}));

export default verifyToken;
