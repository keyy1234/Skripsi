const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Import controller
let rekamMedisController;
try {
  rekamMedisController = require('../controllers/rekamMedisController');
} catch (error) {
  console.error('Failed to load rekamMedisController:', error.message);
  // Fallback empty controller
  rekamMedisController = {
    createRekamMedis: (req, res) => res.status(501).json({ success: false, message: 'Not implemented' }),
    getStatus: (req, res) => res.status(501).json({ success: false, message: 'Not implemented' }),
    getByPatientId: (req, res) => res.status(501).json({ success: false, message: 'Not implemented' }),
    updateBlockchainStatus: (req, res) => res.status(501).json({ success: false, message: 'Not implemented' })
  };
}

// Semua route memerlukan autentikasi
router.use(authMiddleware);

// Route CRUD rekam medis
router.post('/', rekamMedisController.createRekamMedis);
router.get('/:id/status', rekamMedisController.getStatus);
router.get('/pasien/:patientId', rekamMedisController.getByPatientId);
router.put('/:id/blockchain', rekamMedisController.updateBlockchainStatus);

module.exports = router;