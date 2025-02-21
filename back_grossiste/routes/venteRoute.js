const express = require('express');
const router = express.Router();
const VenteController = require('../controllers/venteController');

router.post('/valider', VenteController.validerVente);
router.post("/retour", VenteController.validerRetourProduits);

module.exports = router;
