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
router.delete('/supprimerAchat', async (req, res) => {
    try {
        const { codeProduit, nom, total } = req.query; // Paramètres dans l'URL

        // Vérification si les paramètres sont fournis
        if (!codeProduit || !nom || !total) {
            return res.status(400).json({ message: "Les paramètres 'codeProduit', 'nom' et 'total' sont requis" });
        }
console.log(req.query);
        // Trouver le produit correspondant au codeProduit et nom
        const produitExistant = await Produit.findOne({
            codeProduit: codeProduit, // Chercher par codeProduit
            nom: nom                  // Chercher par nom
        });

        if (!produitExistant) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }

        // Trouver l'achat correspondant à ces critères
        const achatExistant = await Achat.findOne({
            produit: produitExistant._id, // Trouver par l'ID du produit
            total: total                  // Trouver par le total
        });

        if (!achatExistant) {
            return res.status(404).json({ message: "Achat non trouvé" });
        }


 
        // Supprimer l'achat de la base de données (pas le produit)
        await Achat.findByIdAndDelete(achatExistant._id);

        // Retourner une réponse de succès
        res.status(200).json({
            message: "Achat supprimé avec succès",
            achatSupprime: achatExistant,
            
        });

    } catch (error) {
        console.error("Erreur lors de la suppression de l'achat:", error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'achat", error: error.message });
    }
});





module.exports = router;
