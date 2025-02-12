const Commande = require('../models/Commandes');
const Produit = require("../models/Produits");
// Ajouter une nouvelle commande
exports.ajouterCommande = async (req, res) => {
    try {
        const { clientId, vendeurId, produits } = req.body;

        // Valider si tous les produits existent dans la base de données
        const produitsDetails = await Promise.all(produits.map(async (item) => {
            const produit = await Produit.findById(item.produit);
            if (!produit) {
                throw new Error(`Produit avec ID ${item.produit} non trouvé.`);
            }

            // Calculer le prix total du produit
            const prixUnitaire = produit.prixdevente; // Récupérer le prix de vente du produit
            const totalProduit = prixUnitaire * item.quantite;

            return {
                produit: produit._id,
                quantite: item.quantite,
                prixUnitaire,
                total: totalProduit
            };
        }));

        // Calculer le total général de la commande
        const totalGeneral = produitsDetails.reduce((acc, item) => acc + item.total, 0);

        // Créer la commande avec les produits détaillés et le total général
        const nouvelleCommande = new Commande({
            clientId,
            vendeurId,
            produits: produitsDetails,
            totalGeneral
        });

        // Sauvegarder la commande dans la base de données
        await nouvelleCommande.save();

        res.status(201).json({
            message: "Commande créée avec succès.",
            commande: nouvelleCommande
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// Récupérer toutes les commandes
exports.getCommandes = async (req, res) => {
    try {
        const commandes = await Commande.find();
        res.status(200).json(commandes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer une commande par son ID
exports.getCommandeById = async (req, res) => {
    try {
        const commande = await Commande.findById(req.params.id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }
        res.status(200).json(commande);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour une commande
exports.updateCommande = async (req, res) => {
    try {
        const commande = await Commande.findById(req.params.id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        const { produits } = req.body;
        let totalGeneral = 0;
        const produitsAvecTotal = produits.map(item => {
            const totalProduit = item.prixUnitaire * item.quantite;
            totalGeneral += totalProduit;
            return {
                ...item,
                total: totalProduit
            };
        });

        commande.produits = produitsAvecTotal;
        commande.totalGeneral = totalGeneral;

        await commande.save();
        res.status(200).json({ message: "Commande mise à jour avec succès", commande });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer une commande
exports.deleteCommande = async (req, res) => {
    try {
        const commande = await Commande.findByIdAndDelete(req.params.id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }
        res.status(200).json({ message: "Commande supprimée avec succès" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
