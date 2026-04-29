const express = require('express');
const router = express.Router();
const penunjangController = require('../../controllers/pemeriksaan_pasien/penunjangController');
const authMiddleware = require('../../middleware/authMiddleware');

// Semua route memerlukan autentikasi
router.use(authMiddleware);

// Route CRUD Penunjang
router.post('/', penunjangController.createPenunjang);
router.get('/', penunjangController.getAllPenunjang);
router.get('/:id', penunjangController.getPenunjangById);
router.put('/:id/hasil', penunjangController.updateHasilPenunjang);
router.put('/:id/status', penunjangController.updateStatusPenunjang);
router.put('/:id/blockchain', penunjangController.updateBlockchainStatus);
router.delete('/:id', penunjangController.deletePenunjang);

module.exports = router;