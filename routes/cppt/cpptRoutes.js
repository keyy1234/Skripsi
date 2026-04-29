const express = require('express');
const router = express.Router();
const cpptController = require('../../controllers/cppt/cpptController');
const authMiddleware = require('../../middleware/authMiddleware');

// Semua route memerlukan autentikasi
router.use(authMiddleware);

// Route CRUD CPPT
router.post('/', cpptController.createCPPT);
router.get('/', cpptController.getAllCPPT);
router.get('/:id', cpptController.getCPPTById);
router.put('/:id', cpptController.updateCPPT);
router.delete('/:id', cpptController.deleteCPPT);

// Route khusus
router.put('/:id/verify-dpjp', cpptController.verifyDPJP);
router.put('/:id/blockchain', cpptController.updateBlockchainStatus);

module.exports = router;