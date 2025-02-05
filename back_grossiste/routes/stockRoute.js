const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Créer un stock
router.post('/', stockController.createOrUpdateStock);

// Obtenir tous les stocks
router.get('/', stockController.getAllStocks);

// Obtenir un stock par ID
router.get('/:id', stockController.getStockById);

// Mettre à jour un stock
router.put('/:id', stockController.updateStock);

// Supprimer un stock
router.delete('/:id', stockController.deleteStock);

module.exports = router;
