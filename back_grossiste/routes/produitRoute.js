const express = require("express");
const router = express.Router();
const produitController = require("../controllers/produitController");

// Route pour ajouter un produit
router.post("/ajouter", produitController.ajouterProduit);
router.get("/afficher", produitController.afficherProduits);
router.put("/modifier/:id", produitController.modifierProduit);
router.delete("/supprimer/:id", produitController.supprimerProduit);
router.get("/count", produitController.countProduits);
router.get("/fournisseur/:fournisseurId", produitController.getProduitsParFournisseur);
module.exports = router;
