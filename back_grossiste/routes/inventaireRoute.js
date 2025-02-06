const express = require('express');
const router = express.Router();
const inventaireController = require('../controllers/inventaireController');

// Route pour créer un inventaire (ajustement de stock)
router.post('/ajouter', inventaireController.createInventaire);

// Route pour obtenir tous les inventaires
router.get('/inventaires', inventaireController.getAllInventaires);

// Route pour obtenir un inventaire spécifique par ID
router.get('/inventaire/:id', inventaireController.getInventaireById);

// Route pour mettre à jour un inventaire par ID
router.put('/inventaire/:id', inventaireController.updateInventaire);  // Ajouter cette route

// Route pour supprimer un inventaire par ID
router.delete('/inventaire/:id', inventaireController.deleteInventaire);

module.exports = router;
