const express = require('express');
const router = express.Router();
const commercialController = require('../controllers/commercialController');

// Créer un commercial
router.post('/', commercialController.createCommercial);

// Récupérer tous les commerciaux
router.get('/', commercialController.getAllCommercials);

// Récupérer un commercial par son ID
router.get('/:id', commercialController.getCommercialById);

// Mettre à jour les informations d'un commercial
router.put('/:id', commercialController.updateCommercial);

// Supprimer un commercial
router.delete('/:id', commercialController.deleteCommercial);

module.exports = router;
