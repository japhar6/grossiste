const express = require('express');
const router = express.Router();
const commercialActivityController = require('../controllers/activiteController');

// Ajouter des produits pris
router.post('/add-pris/:commercialId', commercialActivityController.addProduitsPris);

// Ajouter des produits retournés
router.post('/add-retour/:commercialId', commercialActivityController.addProduitsRetournes);

// Ajouter un paiement pour régler la dette
router.post('/add-paiement/:commercialId', commercialActivityController.addPaiement);

// Récupérer l'historique des activités commerciales d'un commercial
router.get('/:commercialId', commercialActivityController.getActiviteCommerciale);

module.exports = router;
