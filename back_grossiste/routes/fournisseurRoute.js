const express = require('express');

const router = express.Router();
const fournisseurController = require("../controllers/fournisseurController");

// Définition des routes
router.post("/", fournisseurController.ajouterFournisseur);
router.get("/", fournisseurController.getFournisseurs);
router.get("/:id", fournisseurController.getFournisseurById);
router.put("/:id", fournisseurController.updateFournisseur);
router.delete("/:id", fournisseurController.deleteFournisseur);

module.exports = router;
