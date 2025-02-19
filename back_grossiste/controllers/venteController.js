const Vente = require('../models/Ventes');
const Commande = require('../models/Commandes');
const Stock = require('../models/Stock');
const Produit = require("../models/Produits");

// Valider la vente après validation par le magasinier
exports.validerVente = async (req, res) => {
    try {
        const { commandeId, magasinierId } = req.body;

        // Récupérer la commande validée par le magasinier
        const commande = await Commande.findById(commandeId).populate('produits.produit');
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Vérifier si la commande est prête à sortir
        if (commande.statut !== 'terminée') {
            return res.status(400).json({ message: "La commande doit être validée par le caissier avant" });
        }

        // Créer une nouvelle vente
        const vente = new Vente({
            commandeId,
            produits: commande.produits.map(item => ({
                produit: item.produit._id,
                quantite: item.quantite,
            })),
            magasinierId,
            statut: 'validée', // La vente est directement validée
            dateValidationMagasinier: Date.now(),
        });

        // Sauvegarder la vente dans la base de données
        await vente.save();

        // Réduire les quantités dans le stock
        await Promise.all(commande.produits.map(async (item) => {
            const stock = await Stock.findOne({ produit: item.produit._id, statut: 'actif' });
            if (!stock) {
                throw new Error(`Produit ${item.produit.nom} non trouvé dans le stock`);
            }

            // Réduction de la quantité de stock
            stock.quantité -= item.quantite;
            stock.valeurTotale = stock.quantité * stock.prixUnitaire;

            // Sauvegarder les modifications du stock
            await stock.save();
        }));

        // Mettre à jour la commande avec le statut 'livrée'
        commande.statut = 'livrée';
        await commande.save();

        res.status(200).json({
            message: "Vente validée avec succès et commande marquée comme livrée",
            vente,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
