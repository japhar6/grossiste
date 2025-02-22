const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Créer un stock
router.post('/', stockController.ajouterOuMettreAJourStock);

// Obtenir tous les stocks
router.get('/', stockController.getAllStocks);

// Obtenir un stock par ID
router.get('/:id', stockController.getStockById);

// Mettre à jour un stock
router.put('/:id', stockController.updateStock);

// Supprimer un stock
router.delete('/:id', stockController.deleteStock);

// Ajouter une route pour retourner des produits (ajuster le stock après un retour)
router.post('/retour/:id', stockController.retournerProduits);

// Ajouter une route pour sortir des produits pour un commercial
router.put('/sortir/:commandeId', stockController.sortirProduitsStock);

router.get('/stocks/:entrepotId', stockController.getStocksByEntrepot);
router.get('/produits/quantite/:id', stockController.getQuantiteProduitById);
module.exports = router;
