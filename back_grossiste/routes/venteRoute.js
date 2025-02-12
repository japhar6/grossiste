const express = require('express');
const router = express.Router();
const VenteController = require('../controllers/venteController');

router.post('/valider', VenteController.validerVente);

module.exports = router;
