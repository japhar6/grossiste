const express = require('express');
const router = express.Router();
const fournisseurController = require("../controllers/fournisseurController");
const upload = require("../config/multerLogo"); 

// Route d'ajout de fournisseur avec upload d'image
router.post("/", upload.single("logo"), fournisseurController.ajouterFournisseur);

router.get("/", fournisseurController.getFournisseurs);
router.get("/:id", fournisseurController.getFournisseurById);
router.put("/:id", fournisseurController.updateFournisseur);
router.delete("/:id", fournisseurController.deleteFournisseur);

module.exports = router;
