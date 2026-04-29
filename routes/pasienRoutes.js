const express = require('express');
const router = express.Router();
const pasienController = require('../controllers/pasienController');
const authMiddleware = require('../middleware/authMiddleware');

// Semua route pasien memerlukan autentikasi
router.use(authMiddleware);

// Route CRUD pasien
router.post('/', pasienController.createPasien);           // POST /api/pasien - Registrasi
router.get('/', pasienController.getAllPasien);            // GET /api/pasien - Semua pasien
router.get('/:id', pasienController.getPasienById);        // GET /api/pasien/:id - Detail pasien
router.put('/:id', pasienController.updatePasien);         // PUT /api/pasien/:id - Update pasien
router.delete('/:id', pasienController.deletePasien);      // DELETE /api/pasien/:id - Hapus pasien

module.exports = router;