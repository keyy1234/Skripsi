const express = require('express');
const router = express.Router();
const asesmenKeperawatanController = require('../../../controllers/keperawatan/asesmen_awal/asesmenKeperawatanController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Semua route memerlukan autentikasi
router.use(authMiddleware);

// Route untuk menyimpan semua asesmen sekaligus
router.post('/save-all', asesmenKeperawatanController.saveAllAsesmen);

// Route untuk mengambil semua asesmen berdasarkan patient
router.get('/patient/:patientId', asesmenKeperawatanController.getAllAsesmenByPatient);

module.exports = router;