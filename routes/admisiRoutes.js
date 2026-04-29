const express = require('express');
const router = express.Router();
const admisiController = require('../controllers/admisiController');
const authMiddleware = require('../middleware/authMiddleware');

// Semua route admisi memerlukan autentikasi
router.use(authMiddleware);

// Route CRUD admisi
router.post('/', admisiController.createAdmisi);                    // POST /api/admisi
router.get('/', admisiController.getAllAdmisi);                     // GET /api/admisi
router.get('/:id', admisiController.getAdmisiById);                 // GET /api/admisi/:id
router.get('/pasien/:patientId', admisiController.getAdmisiByPatient); // GET /api/admisi/pasien/:patientId
router.put('/:id/status', admisiController.updateAdmisiStatus);     // PUT /api/admisi/:id/status
router.delete('/:id', admisiController.deleteAdmisi);               // DELETE /api/admisi/:id

module.exports = router;