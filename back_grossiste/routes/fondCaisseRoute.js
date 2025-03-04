const express = require("express");
const router = express.Router();

const foncCaisseController = require("../controllers/fondCaisseController");

// Définir la route pour récupérer les paiements par période
router.get("/totals/:periode", foncCaisseController.getTotalFondCaisseParPeriode);

module.exports = router;
