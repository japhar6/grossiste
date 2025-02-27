const Vente = require('../models/Ventes');
const Commande = require('../models/Commandes');
const Stock = require('../models/Stock');
const Produit = require("../models/Produits");
const VenteCom = require('../models/VenteComm');
const PaiementCommerciale = require("../models/PaimentCommerciale");


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
        if (commande.statut !== 'payé') {
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

        // Réduire les quantités dans le stock en appliquant FIFO
        await Promise.all(commande.produits.map(async (item) => {
            let remainingQuantity = item.quantite;  // Quantité restante à réduire
            const produitId = item.produit._id;

            // Trouver tous les stocks du produit en question, triés par date d'entrée croissante (FIFO)
            const stocks = await Stock.find({ produit: produitId, statut: 'actif' }).sort({ dateEntree: 1 });
            
            if (stocks.length === 0) {
                throw new Error(`Le produit ${item.produit.nom} est épuisé dans le stock`);
            }

            // Réduire les quantités de stock en respectant FIFO
            for (let stock of stocks) {
                if (remainingQuantity <= 0) break;

                const availableQuantity = stock.quantité;

                if (availableQuantity > remainingQuantity) {
                    // Si le stock courant est suffisant pour couvrir la vente, on réduit uniquement la quantité nécessaire
                    stock.quantité -= remainingQuantity;
                    stock.valeurTotale = stock.quantité * stock.prixUnitaire;
                    await stock.save(); // Sauvegarder le stock après la réduction
                    remainingQuantity = 0; // Plus de quantité à réduire
                } else {
                    // Si le stock courant est insuffisant, on consomme tout ce stock et on passe au suivant
                    remainingQuantity -= availableQuantity;
                    stock.quantité = 0; // Réduire complètement ce stock
                    stock.valeurTotale = 0;
                    await stock.save(); // Sauvegarder la suppression du stock
                }
            }

            // Si la quantité demandée n'a pas été entièrement réduite, cela signifie qu'il n'y a pas assez de stock
            if (remainingQuantity > 0) {
                throw new Error(`Quantité insuffisante pour le produit ${item.produit.nom}. Disponible: ${item.quantite - remainingQuantity}, Demandée: ${item.quantite}`);
            }

        }));

        // Mettre à jour la commande avec le statut 'livrée'
        commande.statut = 'payé et livrée';
        await commande.save();

        res.status(200).json({
            message: "Vente validée avec succès et commande marquée comme livrée",
            vente,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.validerRetourProduits = async (req, res) => {
    try {
        const { venteComId, magasinierId } = req.body;

        // Vérifier si la vente existe
        const venteCom = await VenteCom.findById(venteComId).populate('produitsRestants.produitId');
        if (!venteCom) {
            return res.status(404).json({ message: "Vente non trouvée" });
        }

        // Vérifier si des produits restants existent
        if (!venteCom.produitsRestants || venteCom.produitsRestants.length === 0) {
            return res.status(400).json({ message: "Aucun produit restant à retourner" });
        }

        // Mettre à jour le stock
        await Promise.all(venteCom.produitsRestants.map(async (item) => {
            const stock = await Stock.findOne({ produit: item.produitId._id, statut: 'actif' });

            if (!stock) {
                throw new Error(`Stock introuvable pour le produit : ${item.produitId.nom}`);
            }

            // Ajouter la quantité retournée au stock
            stock.quantité += item.quantiteRestante;
            stock.valeurTotale = stock.quantité * stock.prixUnitaire;

            await stock.save();
        }));

        // Mettre à jour l'état de la vente
        venteCom.magasinierId = magasinierId;
        venteCom.dateValidationMagasinier = Date.now();

        await venteCom.save();

        // Trouver le paiement lié à cette vente (commande)
        const paiementCom = await PaiementCommerciale.findOne({ commandeId: venteCom.commandeId });
        if (!paiementCom) {
            return res.status(404).json({ message: "Paiement non trouvé pour cette commande" });
        }

        // Vérifier si tous les produits de la vente ont été retournés
        const tousLesProduitsRetournés = venteCom.produitsRestants.every(item => item.quantiteRestante > 0);

        if (tousLesProduitsRetournés) {
            paiementCom.statut = "Produits retourner";
        }

        await paiementCom.save();

        res.status(200).json({
            message: "Retour validé, stock mis à jour et statut de paiement mis à jour",
            venteCom,
            paiementCom
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};