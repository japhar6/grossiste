const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paiementController');

// Route pour créer un paiement
router.post('/', paymentController.createPaiement);

// Route pour récupérer tous les paiements
router.get('/', paymentController.getAllPaiements);

// Route pour récupérer un paiement par ID
router.get('/:id', paymentController.getPaiementById);

// Route pour mettre à jour un paiement
router.put('/:id', paymentController.updatePaiement);

// Route pour supprimer un paiement
router.delete('/:id', paymentController.deletePaiement);

module.exports = router;
