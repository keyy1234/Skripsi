// src/routes/igd/section/treatmentRoutes.js
const express = require('express');
const router = express.Router();
const treatmentController = require('../../../controllers/igd/section/treatmentController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Gunakan middleware auth
router.use(authMiddleware);

// Treatment routes
router.get('/treatments/:encounterId', treatmentController.getTreatmentsByEncounter);
router.get('/treatments/detail/:treatmentId', treatmentController.getTreatmentById);
router.get('/treatments/filter/by-type', treatmentController.getTreatmentsByType);
router.get('/treatments/stats/:encounterId', treatmentController.getTreatmentStats);
router.get('/medic-staff', treatmentController.getMedicStaff); // <-- TAMBAHKAN RUTE INI
router.post('/treatments', treatmentController.createTreatment);
router.put('/treatments/:treatmentId', treatmentController.updateTreatment);
router.delete('/treatments/:treatmentId', treatmentController.deleteTreatment);

module.exports = router;