const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/CommandeController");

router.post("/ajouter", commandeController.ajouterBDC);

module.exports = router;
