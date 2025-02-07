const express = require('express');
const router = express.Router();
const transfertController = require('../controllers/transfertController');

// Définition des routes
router.post('/transfert', transfertController.transfertProduit);
router.put('/terminer/:id', transfertController.terminerTransfert);

module.exports = router;
