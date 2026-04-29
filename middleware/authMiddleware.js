const { verifyToken } = require('../utils/generateToken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak ditemukan.'
    });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token tidak valid atau expired.'
    });
  }
  
  req.user = decoded;
  next();
};

module.exports = authMiddleware;