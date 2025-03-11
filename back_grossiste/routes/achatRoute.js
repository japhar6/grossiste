const express = require('express');
const router = express.Router();
const achatController = require("../controllers/achatController");
const Achat = require("../models/Achats");
const Stock = require('../models/Stock');
router.post('/ajouter', achatController.ajouterAchat);
router.get("/afficher", achatController.afficherAchats);
router.put("/modifier/:id", achatController.modifierAchat);
router.delete('/supprimer/:id', achatController.supprimerAchat);
const Produit = require("../models/Produits");
router.post('/valider/:panierId', achatController.validerPanier);
const Panier = require("../models/Paiement"); 
router.get("/panier/:panierId", achatController.getAchatsByPanier);

router.get('/totals/:periode',achatController.getTotalAchatsParPeriode);
//// Suppression d'un achat basé sur les critères : codeProduit, nom et total
router.delete('/supprimerAchat/:id', async (req, res) => {
    try {
        const { id } = req.params; // Paramètres dans l'URL

        // Vérification si les paramètres sont fournis

       
        await Achat.findByIdAndDelete(id);

        // Retourner une réponse de succès
        res.status(200).json({
            message: "Achat supprimé avec succès",
         
            
        });

    } catch (error) {
        console.error("Erreur lors de la suppression de l'achat:", error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'achat", error: error.message });
    }
});





module.exports = router;
