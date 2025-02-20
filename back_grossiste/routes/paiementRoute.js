const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');

// Route pour ajouter un paiement
router.post('/ajouter/:id', paiementController.validerpayement);

// Route pour récupérer tous les paiements
router.get('/', paiementController.getPaiements);

// Route pour récupérer un paiement par son ID
router.get('/recuperer/:id', paiementController.getPaiementById);

router.get("/caissier/:idCaissier", paiementController.getPaiementsParCaissier);

router.get('/performance-vente', paiementController.getPerformanceVenteParMois);
module.exports = router;
