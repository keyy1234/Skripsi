const jwt = require('jsonwebtoken');

// Gunakan default secret jika environment variable tidak ada
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeychangethis12345';

const generateToken = (user) => {
  console.log('Generating token for user:', user.user_id);
  console.log('JWT_SECRET exists:', !!JWT_SECRET);
  
  return jwt.sign(
    {
      id: user.id,
      userId: user.user_id,
      role: user.role,
      name: user.name,
      wallet_address: user.wallet_address  // ← tambahkan wallet_address ke payload
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
};

module.exports = { generateToken, verifyToken };