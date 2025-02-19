const PaiementCommerciale = require("../models/PaimentCommerciale");
const Commande = require("../models/Commandes");
const Vente = require('../models/VenteComm'); 

exports.validerPaiementCommerciale = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;  // Pas de remise pour un commercial

        // Recherche de la commande par ID
        const commande = await Commande.findById(id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Vérifier si c'est un commercial
        if (commande.typeClient !== "Commercial") {
            return res.status(400).json({ message: "Cette commande n'est pas destinée à un commercial" });
        }

        // Le montant final à payer est simplement le total de la commande
        const montantFinalPaye = commande.totalGeneral;

        // Créer un paiement à crédit pour le commercial
        const paiementCommerciale = new PaiementCommerciale({
            commandeId: commande._id,
            montantPaye: 0,  // Pas encore payé
            montantRestant: montantFinalPaye,  // Le montant restant à payer
            totalPaiement: montantFinalPaye,  // Le montant total à payer
            statut: "partiel"  // Statut initial à "partiel"
        });

        // Sauvegarder le paiement
        await paiementCommerciale.save();

        return res.status(200).json({ message: "Paiement à crédit validé pour commercial", paiementCommerciale });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.mettreAJourPaiementCommerciale = async (req, res) => {
    try {
        const { id } = req.params;  // ID du paiement commercial
        const { produitsVendus } = req.body;  // Liste des produits vendus avec quantités

        const paiementCommerciale = await PaiementCommerciale.findById(id);
        if (!paiementCommerciale) {
            return res.status(404).json({ message: "Paiement à crédit non trouvé" });
        }

        const commande = await Commande.findById(paiementCommerciale.commandeId);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Vérifier si le paiement est déjà complet
        if (paiementCommerciale.statut === "complet") {
            return res.status(400).json({ message: "Le paiement est déjà complet, vous ne pouvez plus modifier la commande." });
        }

        let montantTotalVendu = 0;
        produitsVendus.forEach(produit => {
            const produitCommande = commande.produits.find(item => item.produit.toString() === produit.produitId.toString());
            if (produitCommande) {
                montantTotalVendu += produitCommande.prixUnitaire * produit.quantite;
            }
        });

        paiementCommerciale.montantPaye += montantTotalVendu;
        paiementCommerciale.montantRestant -= montantTotalVendu;

        // Si le montant restant est 0, on marque le paiement comme complet
        if (paiementCommerciale.montantRestant <= 0) {
            paiementCommerciale.statut = "complet";
            paiementCommerciale.montantRestant = 0;
        }

        // Sauvegarder les mises à jour
        await paiementCommerciale.save();

        // Enregistrer la vente
        const vente = new Vente({
            commercialId: commande.commercialId,
            commandeId: commande._id,
            produitsVendus: produitsVendus,
            montantTotal: montantTotalVendu
        });

        await vente.save();

        return res.status(200).json({
            message: "Paiement et vente mis à jour avec succès",
            paiementCommerciale,
            vente
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.recupererPerformanceCommercial = async (req, res) => {
    try {
        const { commercialId } = req.params;

        // Récupérer toutes les ventes associées au commercial
        const ventes = await Vente.find({ commercialId }) // Changer pour récupérer toutes les ventes
            .populate('produitsVendus.produitId', 'nom prixUnitaire') // Populate pour obtenir les détails des produits
            .exec();

        let totalVentes = ventes.length;
        let montantTotal = 0;
        ventes.forEach(vente => {
            montantTotal += vente.montantTotal;
        });

        return res.status(200).json({
            commercialId,
            totalVentes,
            montantTotal,
            ventes // Optionnel, si tu veux retourner les détails des ventes
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
