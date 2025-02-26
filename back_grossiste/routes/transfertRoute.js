const express = require('express');
const router = express.Router();
const transfertController = require('../controllers/transfertController');

// Routes du processus de transfert
router.post('/transfert', transfertController.transfertProduit); // Initier un transfert
router.put('/valider-admin/:id', transfertController.validerParAdmin); // Validation admin
router.put('/reception/:id', transfertController.receptionnerTransfert); // Réception par l'entrepôt destinataire
router.put('/terminer/:id', transfertController.terminerTransfert); // Terminer un transfert
router.get('/recup', transfertController.recuperer); // Récupérer les transferts

module.exports = router;
