const express = require('express');
const router = express.Router();
const ttvController = require('../../../controllers/igd/section/ttvController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Gunakan auth middleware untuk semua routes
router.use(authMiddleware);

// Routes berdasarkan encounter
router.get('/encounters/:encounterId/ttv', ttvController.getTTVByEncounter);
router.get('/encounters/:encounterId/ttv/latest', ttvController.getLatestTTV);
router.post('/encounters/:encounterId/ttv', ttvController.createTTV);

// Routes berdasarkan ttvId
router.get('/ttv/:ttvId', ttvController.getTTVById);
router.put('/ttv/:ttvId', ttvController.updateTTV);
router.delete('/ttv/:ttvId', ttvController.deleteTTV);

module.exports = router;