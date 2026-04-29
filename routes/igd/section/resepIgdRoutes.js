// src/routes/igd/section/resepIgdRoutes.js
const express = require('express');
const router = express.Router();
const resepController = require('../../../controllers/igd/section/resepController');
const authMiddleware = require('../../../middleware/authMiddleware');

router.use(authMiddleware);

// Resep routes
router.get('/resep/:encounterId', resepController.getResepByEncounter);
router.get('/resep/detail/:resepId', resepController.getResepById);
router.post('/resep', resepController.createResep);
router.put('/resep/:resepId', resepController.updateResep);
router.delete('/resep/:resepId', resepController.deleteResep);
router.patch('/resep/:resepId/blockchain', resepController.updateBlockchainHash);

module.exports = router;