const express = require("express");
const router = express.Router();
const panierController = require("../controllers/panierController");

router.post("/ajouter", panierController.creerPanier);
router.get("/afficher", panierController.getAllPaniers);
router.get("/afficher/:panierId", panierController.getPanierById);
router.delete("/supprimer/:panierId", panierController.supprimerPanier);
router.get("/tous/:modePaiement", panierController.historiquePanier);
router.get("/totals/:periode", panierController.getTotalPaniersParPeriode);
router.put("/modifier-statut/:id", panierController.modifierStatutPanier);
module.exports = router;
