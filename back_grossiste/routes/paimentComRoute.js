const express = require('express');
const router = express.Router();

// Importer le contrôleur
const paiementController = require('../controllers/paimentComController');

// Route pour valider un paiement commercial
router.post('/commercial/:id', paiementController.validerPaiementCommerciale);

// Mettre à jour le paiement après vente des produits
router.put('/mettre-ajour/:referenceFacture', paiementController.mettreAJourPaiementCommerciale);

router.get('/performance/commercial/:commercialId', paiementController.getVentesByCommercial);

router.get("/info", paiementController.getPaiementsCommerciales);



module.exports = router;
