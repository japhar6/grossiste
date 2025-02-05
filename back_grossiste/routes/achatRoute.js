const express = require('express');
const router = express.Router();
const achatController = require("../controllers/achatController");

router.post('/ajouter', achatController.ajouterAchat);
router.get("/afficher", achatController.afficherAchats);
router.put("/modifier/:id", achatController.modifierAchat);
router.delete('/supprimer/:id', achatController.supprimerAchat);
module.exports = router;
