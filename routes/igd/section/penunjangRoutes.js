// src/routes/igd/section/penunjangRoutes.js
const express = require('express');
const router = express.Router();
const penunjangController = require('../../../controllers/igd/section/penunjangController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Gunakan middleware auth
router.use(authMiddleware);

// Penunjang routes
router.get('/penunjang/:encounterId', penunjangController.getTestsByEncounter);
router.get('/penunjang/detail/:testId', penunjangController.getTestById);
router.get('/penunjang/by-type/:encounterId/:type', penunjangController.getTestsByType);
router.get('/penunjang/pending/:encounterId', penunjangController.getPendingTests);
router.get('/penunjang/completed/:encounterId', penunjangController.getCompletedTests);
router.get('/penunjang/stats/:encounterId', penunjangController.getTestStats);
router.post('/penunjang', penunjangController.createTest);
router.put('/penunjang/:testId', penunjangController.updateTest);
router.patch('/penunjang/:testId/status', penunjangController.updateStatus);
router.post('/penunjang/:testId/result', penunjangController.saveResult);
router.delete('/penunjang/:testId', penunjangController.deleteTest);

module.exports = router;