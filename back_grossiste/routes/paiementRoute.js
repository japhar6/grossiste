const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');

// Route pour ajouter un paiement
router.post('/ajouter/:id', paiementController.validerpayement);

// Route pour récupérer tous les paiements
router.get('/', paiementController.getPaiements);
router.get('/acredit', paiementController.getPaiementsCredittout);

// Route pour récupérer un paiement par son ID
router.get('/recuperer/:id', paiementController.getPaiementById);

router.get("/caissier/:idCaissier", paiementController.getPaiementsParCaissier);

router.get('/performance-vente', paiementController.getPerformanceVenteParMois);

router.get('/info/:id', paiementController.getPaiementAvecCommande);

router.get('/totals/:periode', paiementController.getTotalPaiementsParPeriode);

router.put("/payer/:referenceFacture", paiementController.mettreAJourPaiement);
router.get("/credit", paiementController.getPaiementsCredit);
router.get("/prod", paiementController.getProduitsLesPlusVendus);
router.get('/check-payments-due', paiementController.checkPaymentsDue);
module.exports = router;
