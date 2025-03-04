const express = require("express");
const router = express.Router();
const decaissementController = require("../controllers/dacaissementController");

// Route pour effectuer un décaissement
router.post("/ajouter", decaissementController.effectuerDecaissement);
router.get("/afficher", decaissementController.getTousLesDecaissements);


module.exports = router;
