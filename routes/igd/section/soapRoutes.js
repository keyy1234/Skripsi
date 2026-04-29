// src/routes/igd/section/soapRoutes.js
const express = require('express');
const router = express.Router();
const soapController = require('../../../controllers/igd/section/soapController');
const authMiddleware = require('../../../middleware/authMiddleware');

router.use(authMiddleware);

// SOAP routes
router.get('/soap/:encounterId', soapController.getSOAPByEncounter);
router.get('/soap/detail/:soapId', soapController.getSOAPById);
router.get('/soap/latest-ttv/:encounterId', soapController.getLatestTTV);
router.get('/soap/latest-diagnoses/:encounterId', soapController.getLatestDiagnosesForAssessment);
router.get('/soap/latest-treatments/:encounterId', soapController.getLatestTreatmentsForPlan);
router.get('/soap/plan-data/:encounterId', soapController.getPlanData);  // <-- ENDPOINT BARU
router.get('/soap/generate-plan/:encounterId', soapController.generatePlanFromTreatments);
router.post('/soap', soapController.createSOAP);
router.put('/soap/:soapId', soapController.updateSOAP);
router.delete('/soap/:soapId', soapController.deleteSOAP);

module.exports = router;