const PaiementCommerciale = require("../models/PaimentCommerciale");
const Commande = require("../models/Commandes");
const VenteCom = require('../models/VenteComm'); // Assure-toi du bon chemin
const Produit = require("../models/Produits");
const mongoose = require('mongoose');

exports.validerPaiementCommerciale = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut, idCaissier } = req.body;  // Pas de remise pour un commercial

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
        
        // Mettre à jour le statut de la commande
        commande.statut = "payé";
        await commande.save();

        // Créer un paiement à crédit pour le commercial
        const paiementCommerciale = new PaiementCommerciale({
            commandeId: commande._id,
            montantPaye: 0,  // Pas encore payé
            montantRestant: montantFinalPaye,  // Le montant restant à payer
            totalPaiement: montantFinalPaye,  // Le montant total à payer
            statut: "non payé", // Statut initial à "partiel"
            idCaissier, // ID du caissier
            referenceFacture: commande.referenceFacture // Ajout de la référence de facture
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
        const { referenceFacture } = req.params;  
        const { produitsVendus } = req.body;  

        const paiementCommerciale = await PaiementCommerciale.findOne({ referenceFacture });
        if (!paiementCommerciale) {
            console.error(`Paiement à crédit non trouvé pour la référence: ${referenceFacture}`);
            return res.status(404).json({ message: "Paiement à crédit non trouvé" });
        }

        const commande = await Commande.findById(paiementCommerciale.commandeId);
        if (!commande) {
            console.error(`Commande non trouvée pour l'ID: ${paiementCommerciale.commandeId}`);
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Vérifier si le statut est "partiel"
        if (paiementCommerciale.statut !== "non payé") {
            console.error("Tentative de mise à jour d'un paiement qui n'est pas non payé.");
            return res.status(400).json({ message: "Le paiement doit être non payé pour pouvoir être mis à jour." });
        }

        let montantTotalVendu = 0;
        let produitsRestants = [];

        for (const produit of produitsVendus) {
            const produitCommande = commande.produits.find(item => item.produit.toString() === produit.produitId.toString());

            if (produitCommande) {
                montantTotalVendu += produitCommande.prixUnitaire * produit.quantite;

                // Récupérer l'unité du produit depuis la base de données
                const produitDB = await Produit.findById(produit.produitId);
                if (!produitDB) {
                    console.error(`Produit non trouvé : ${produit.produitId}`);
                    return res.status(404).json({ message: `Produit non trouvé : ${produit.produitId}` });
                }

                produitsRestants.push({
                    produitId: produit.produitId,
                    quantiteRestante: produitCommande.quantite - produit.quantite, // Calcul de la quantité restante
                    unite: produitDB.unite  // Ajout de l'unité
                });
            } else {
                console.error(`Produit ${produit.produitId} non trouvé dans la commande.`);
            }
        }

        paiementCommerciale.montantPaye += montantTotalVendu;
        paiementCommerciale.montantRestant = paiementCommerciale.totalPaiement - paiementCommerciale.montantPaye;
        commande.modePaiement = "espèce";
        await commande.save();
        
       
if (paiementCommerciale.montantRestant === 0) {
    paiementCommerciale.statut = "payé complet"; 
} else {
    paiementCommerciale.statut = "payé partiel"; 
}

        await paiementCommerciale.save();

        const vente = new VenteCom({
            commercialId: commande.commercialId,
            commandeId: commande._id,
            produitsVendus: await Promise.all(produitsVendus.map(async produit => {
                const produitDB = await Produit.findById(produit.produitId);
                return {
                    produitId: produit.produitId,
                    quantite: produit.quantite,
                    unite: produitDB.unite  // Ajout de l'unité ici aussi
                };
            })),
            produitsRestants: produitsRestants,  // Ajout des produits restants
            montantTotal: montantTotalVendu
        });

        await vente.save();

        return res.status(200).json({
            message: "Paiement et vente mis à jour avec succès",
            paiementCommerciale,
            vente
        });
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du paiement : ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};




exports.getVentesByCommercial = async (req, res) => {
    try {
        const { commercialId } = req.params;

        const ventes = await VenteCom.find({ commercialId })
        .populate("produitsRestants.produitId", "nom")
        .populate("produitsVendus.produitId", "nom");
    ;
        if (!ventes || ventes.length === 0) {
            return res.status(404).json({ message: "Aucune vente trouvée pour ce commercial" });
        }

        res.status(200).json(ventes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVentesByInfo = async (req, res) => {
    try {
        const { commercialId, commandeId } = req.params;
        
        // Assurez-vous de filtrer par référence de facture (ou un autre critère unique)
        const ventes = await VenteCom.find({ commercialId, commandeId })
            .populate("produitsRestants.produitId", "nom")
            .populate("produitsVendus.produitId", "nom");

        if (!ventes || ventes.length === 0) {
            return res.status(404).json({ message: "Aucune vente trouvée pour ce commercial et cette commande" });
        }

        res.status(200).json(ventes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.getPaiementsCommerciales = async (req, res) => {
    try {
        const paiements = await PaiementCommerciale.find()
            .populate("commandeId", "referenceFacture modePaiement statut date commercialId")
            .populate("idCaissier", "nom")


        const paiementsFormatted = paiements.map(paiement => ({
            commande: paiement.commandeId?._id || "N/A",
            referenceFacture: paiement.commandeId?.referenceFacture || "N/A",
            caissier: paiement.idCaissier ? `${paiement.idCaissier.nom}` : "Inconnu",
            modePaiement: paiement.commandeId?.modePaiement || "Non défini",
            commercial: paiement.commandeId?.commercialId || "N/A",
            statut: paiement.statut,
            date: paiement.createdAt.toISOString().split('T')[0]
        }));
        

        res.status(200).json(paiementsFormatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

