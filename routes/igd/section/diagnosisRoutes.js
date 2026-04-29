// src/routes/igd/section/diagnosisRoutes.js
const express = require('express');
const router = express.Router();
const diagnosisController = require('../../../controllers/igd/section/diagnosisController');
const authMiddleware = require('../../../middleware/authMiddleware');

// ✅ ROUTE ICD-10 DILETAKKAN DI LUAR AUTH MIDDLEWARE (atau sebelum)
// Karena endpoint ini tidak memerlukan encounterId
router.get('/diagnosis/icd10', diagnosisController.getIcd10Codes);

// Gunakan middleware auth untuk route lain yang memerlukan encounterId
router.use(authMiddleware);

// Diagnosis routes yang memerlukan auth
router.get('/diagnosis/:encounterId', diagnosisController.getDiagnosesByEncounter);
router.get('/diagnosis/detail/:diagnosisId', diagnosisController.getDiagnosisById);
router.get('/diagnosis/primary/:encounterId', diagnosisController.getPrimaryDiagnosis);
router.get('/diagnosis/stats/:encounterId', diagnosisController.getDiagnosisStats);
router.post('/diagnosis', diagnosisController.createDiagnosis);
router.put('/diagnosis/:diagnosisId', diagnosisController.updateDiagnosis);
router.delete('/diagnosis/:diagnosisId', diagnosisController.deleteDiagnosis);
router.patch('/diagnosis/:diagnosisId/primary', diagnosisController.setPrimaryDiagnosis);
router.patch('/diagnosis/:diagnosisId/confirm', diagnosisController.confirmDiagnosis);

module.exports = router;