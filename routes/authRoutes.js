const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route untuk CAPTCHA
router.get('/captcha', authController.getCaptcha);

// Route untuk login (dengan verifikasi wallet)
router.post('/login', authController.login);

// Route untuk verifikasi token
router.get('/verify', authController.verify);

// Route untuk verifikasi wallet (session check via wallet)
router.post('/verify-wallet', authController.verifyWallet);

// Route untuk logout
router.post('/logout', authController.logout);

module.exports = router;