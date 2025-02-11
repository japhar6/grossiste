const express = require("express");
const router = express.Router();
const commandeController = require("../controllers/CommandeController");

// Route pour que le vendeur prenne la commande (statut: "en cours")
router.post("/ajouter", commandeController.ajouterBDC);

// Route pour que le caissier valide la commande (changement de statut et application de remise)
router.put("/valider/:id", commandeController.validerCommande);

module.exports = router;
