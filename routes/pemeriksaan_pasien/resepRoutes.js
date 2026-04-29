const express = require('express');
const router = express.Router();
const resepController = require('../../controllers/pemeriksaan_pasien/resepController');
const authMiddleware = require('../../middleware/authMiddleware');

router.use(authMiddleware);
router.post('/', resepController.createResep);
router.get('/', resepController.getAllResep);
router.get('/:id', resepController.getResepById);
router.delete('/:id', resepController.deleteResep);

module.exports = router;