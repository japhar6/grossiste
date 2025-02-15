const express = require('express');
const router = express.Router();

// Importer le contrôleur
const paiementController = require('../controllers/paimentComController');

// Route pour valider un paiement commercial
router.post('/commercial/:id', paiementController.validerPaiementCommerciale);

// Mettre à jour le paiement après vente des produits
router.put('/:id/mettre-ajour', paiementController.mettreAJourPaiementCommerciale);




module.exports = router;
