const { supabase } = require('../config/supabase');
const bcrypt = require('bcryptjs');
const { generateCaptcha, saveCaptcha, verifyCaptcha } = require('../services/captchaService');
const { generateToken } = require('../utils/generateToken');

// GET CAPTCHA
const getCaptcha = async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const captchaText = generateCaptcha();
    
    saveCaptcha(sessionId, captchaText);
    
    res.json({
      success: true,
      captchaText: captchaText,
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Get captcha error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal generate CAPTCHA'
    });
  }
};

// LOGIN dengan verifikasi wallet
const login = async (req, res) => {
  try {
    const { userId, password, role, captchaInput, sessionId, walletAddress } = req.body;
    
    console.log('📝 Login attempt:', { 
      userId, 
      role, 
      walletAddress: walletAddress ? walletAddress.slice(0, 10) + '...' : 'null' 
    });
    
    // Validasi input
    if (!userId || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Harap isi User ID dan Password'
      });
    }
    
    if (!captchaInput || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA diperlukan'
      });
    }
    
    // Validasi wallet address
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Harap hubungkan wallet MetaMask terlebih dahulu'
      });
    }
    
    // Validasi CAPTCHA
    const captchaResult = verifyCaptcha(sessionId, captchaInput);
    if (!captchaResult.valid) {
      return res.status(400).json({
        success: false,
        message: captchaResult.message
      });
    }
    
    // Cari user di database
    const { data: user, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (findError || !user) {
      console.log('❌ User not found:', userId);
      return res.status(401).json({
        success: false,
        message: 'User ID tidak ditemukan'
      });
    }
    
    console.log('✅ User found:', { 
      userId: user.user_id, 
      name: user.name, 
      storedWallet: user.wallet_address ? user.wallet_address.slice(0, 10) + '...' : 'null' 
    });
    
    // VALIDASI WALLET ADDRESS - HARUS COCOK!
    if (!user.wallet_address) {
      console.log('❌ User has no wallet address assigned:', userId);
      return res.status(401).json({
        success: false,
        message: 'Akun ini belum memiliki wallet address. Silakan hubungi administrator.'
      });
    }
    
    // Bandingkan wallet address (case insensitive)
    if (user.wallet_address.toLowerCase() !== walletAddress.toLowerCase()) {
      console.log('❌ Wallet mismatch:', { 
        expected: user.wallet_address, 
        received: walletAddress 
      });
      return res.status(401).json({
        success: false,
        message: 'Wallet yang terhubung tidak cocok dengan akun ini. Pastikan Anda menggunakan wallet yang benar.'
      });
    }
    
    console.log('✅ Wallet verified');
    
    // Validasi role
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        message: `Anda tidak memiliki akses sebagai ${role === 'dokter_dpjp' ? 'Dokter DPJP' : 'Perawat'}`
      });
    }
    
    // Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', userId);
      return res.status(401).json({
        success: false,
        message: 'Password salah'
      });
    }
    
    // Update last_login
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('user_id', userId);
    
    // Generate JWT Token
    console.log('Generating token for user:', userId);
    const token = generateToken({
      id: user.id,
      user_id: user.user_id,
      name: user.name,
      role: user.role,
      wallet_address: user.wallet_address
    });
    
    // Response data user
    const userData = {
      id: user.id,
       staff_id: user.staff_id,  // ← TAMBAHKAN
      userId: user.user_id,
      name: user.name,
      role: user.role,
      nip: user.nip,
      spesialisasi: user.spesialisasi,
      unitKerja: user.unit_kerja,
      email: user.email,
      walletAddress: user.wallet_address
    };
    
    console.log('✅ Login success:', { userId: user.user_id });
    
    res.json({
      success: true,
      message: 'Login berhasil',
      token: token,
      user: userData
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server: ' + error.message
    });
  }
};

// VERIFY TOKEN
const verify = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }
    
    const { verifyToken } = require('../utils/generateToken');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau expired'
      });
    }
    
    res.json({
      success: true,
      user: {
        id: decoded.id,
        userId: decoded.userId,
        role: decoded.role,
        name: decoded.name,
        walletAddress: decoded.wallet_address
      }
    });
    
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// VERIFY WALLET ONLY (untuk session check via wallet)
const verifyWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address diperlukan'
      });
    }
    
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, user_id, name, role, wallet_address')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Wallet tidak terdaftar'
      });
    }
    
    // Generate token untuk wallet-only session
    const token = generateToken({
      id: user.id,
      user_id: user.user_id,
      name: user.name,
      role: user.role,
      wallet_address: user.wallet_address
    });
    
    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        userId: user.user_id,
        name: user.name,
        role: user.role,
        walletAddress: user.wallet_address
      }
    });
    
  } catch (error) {
    console.error('Verify wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// LOGOUT
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout berhasil'
  });
};

module.exports = {
  getCaptcha,
  login,
  verify,
  verifyWallet,
  logout
};