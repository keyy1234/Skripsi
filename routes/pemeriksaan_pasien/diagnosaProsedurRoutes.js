const express = require('express');
const router = express.Router();
const diagnosaProsedurController = require('../../controllers/pemeriksaan_pasien/diagnosaProsedurController');
const authMiddleware = require('../../middleware/authMiddleware');

// Semua route memerlukan autentikasi
router.use(authMiddleware);

// Route CRUD Diagnosa Prosedur
router.post('/', diagnosaProsedurController.createDiagnosaProsedur);
router.get('/', diagnosaProsedurController.getAllDiagnosaProsedur);
router.get('/:id', diagnosaProsedurController.getDiagnosaProsedurById);
router.put('/:id', diagnosaProsedurController.updateDiagnosaProsedur);
router.delete('/:id', diagnosaProsedurController.deleteDiagnosaProsedur);
router.put('/:id/blockchain', diagnosaProsedurController.updateBlockchainStatus);

module.exports = router;