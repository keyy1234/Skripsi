// In-memory storage untuk CAPTCHA (production pakai Redis)
const captchaStore = new Map();

const generateCaptcha = () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789';
  let captchaText = '';
  for (let i = 0; i < 6; i++) {
    captchaText += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return captchaText;
};

const saveCaptcha = (sessionId, text) => {
  captchaStore.set(sessionId, {
    text: text,
    expires: Date.now() + 5 * 60 * 1000 // 5 menit
  });
  
  // Auto delete setelah expired
  setTimeout(() => {
    captchaStore.delete(sessionId);
  }, 5 * 60 * 1000);
};

const verifyCaptcha = (sessionId, input) => {
  const captcha = captchaStore.get(sessionId);
  
  if (!captcha) {
    return { valid: false, message: 'CAPTCHA tidak ditemukan' };
  }
  
  if (captcha.expires < Date.now()) {
    captchaStore.delete(sessionId);
    return { valid: false, message: 'CAPTCHA sudah expired' };
  }
  
  if (captcha.text !== input) {
    return { valid: false, message: 'Kode CAPTCHA salah' };
  }
  
  // Hapus CAPTCHA setelah berhasil
  captchaStore.delete(sessionId);
  return { valid: true, message: 'CAPTCHA valid' };
};

const deleteCaptcha = (sessionId) => {
  captchaStore.delete(sessionId);
};

module.exports = {
  generateCaptcha,
  saveCaptcha,
  verifyCaptcha,
  deleteCaptcha
};