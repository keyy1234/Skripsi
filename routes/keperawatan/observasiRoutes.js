const express = require('express');
const router = express.Router();
const observasiController = require('../../controllers/keperawatan/observasiController');
const authMiddleware = require('../../middleware/authMiddleware');

// Semua route memerlukan autentikasi
router.use(authMiddleware);

// Route CRUD Observasi
router.post('/', observasiController.createObservasi);
router.get('/', observasiController.getAllObservasi);
router.get('/grafik', observasiController.getGrafikTTV);
router.get('/:id', observasiController.getObservasiById);
router.put('/:id', observasiController.updateObservasi);
router.delete('/:id', observasiController.deleteObservasi);
router.put('/:id/blockchain', observasiController.updateBlockchainStatus);

module.exports = router;