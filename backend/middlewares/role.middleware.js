const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized, token tidak ditemukan' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden, hanya admin yang bisa akses' });
  }

  next();
};

export default checkAdmin;
