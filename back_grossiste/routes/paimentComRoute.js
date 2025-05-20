const express = require('express');
const router = express.Router();

// Importer le contrôleur
const paiementController = require('../controllers/paimentComController');

// Route pour valider un paiement commercial
router.post('/commercial/:id', paiementController.validerPaiementCommerciale);

// Mettre à jour le paiement après vente des produits
router.put('/mettre-ajour/:referenceFacture', paiementController.mettreAJourPaiementCommerciale);

router.get('/performance/commercial/:commercialId', paiementController.getVentesByCommercial);


router.get('/recuperer/:id', paiementController.getPaiementById);

router.get('/performance/commercial/:commercialId/commande/:commandeId', paiementController.getVentesByInfo);


router.get("/info", paiementController.getPaiementsCommerciales);

router.get("/infopl", paiementController.getPaiementsCommercialespaye);

router.get("/credit", paiementController.getPaiementsParMode);
module.exports = router;
