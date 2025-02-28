const Achat = require("../models/Achats");
const Produit = require("../models/Produits");
const Fournisseur = require("../models/Fournisseurs");
const Panier = require("../models/Paniers");
const { ajouterOuMettreAJourStock } = require('./stockController'); 
const Stock = require('../models/Stock');
const Entrepot = require('../models/Entrepot'); // Respecte la casse


const { ObjectId } = require('mongodb');
exports.ajouterAchat = async (req, res) => {
    try {
        const { produit, fournisseur, quantite, prixAchat, panierId, ristourneAppliquee, unite } = req.body; // Ajout de 'unite'

        // Vérification de la validité des entrées
        if (isNaN(quantite) || quantite <= 0) {
            return res.status(400).json({ message: "La quantité doit être un nombre positif valide." });
        }
        if (isNaN(prixAchat) || prixAchat <= 0) {
            return res.status(400).json({ message: "Le prix d'achat doit être un nombre valide supérieur à zéro." });
        }
        if (!unite) {
            return res.status(400).json({ message: "L'unité est requise." }); // Vérification de l'unité
        }

        // Vérifier si le produit et le fournisseur existent
        const produitExistant = await Produit.findById(produit);
        if (!produitExistant) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }

        const fournisseurExistant = await Fournisseur.findById(fournisseur);
        if (!fournisseurExistant) {
            return res.status(404).json({ message: "Fournisseur non trouvé" });
        }

        // Vérification de l'ID du panier
        console.log("ID du panier reçu dans le back-end :", panierId);
        const mongoose = require("mongoose");
        if (!mongoose.Types.ObjectId.isValid(panierId)) {
            return res.status(400).json({ message: "L'ID du panier est invalide" });
        }

        // Trouver le panier existant
        let panierExistant = await Panier.findById(panierId);
        if (!panierExistant) {
            return res.status(404).json({ message: "Panier non trouvé" });
        }

        // Calculer le total de l'achat basé uniquement sur la quantité achetée
        const total = quantite * prixAchat;

        // Déterminer la quantité totale de produits offerts par la ristourne
        let produitsOfferts = 0;
        let quantiteTotale = quantite; // Initialiser avec la quantité d'origine

        if (fournisseurExistant.type === "ristourne") {
            if (fournisseurExistant.conditions.typeRistourne === "par_produit") {
                // Récupérer le pourcentage de ristourne à appliquer
                const ristournePourcentage = req.body.ristourneAppliquee;

                console.log('Ristourne appliquée:', ristournePourcentage);
                if (ristournePourcentage && !isNaN(ristournePourcentage) && ristournePourcentage > 0) {
                    produitsOfferts = Math.floor((quantite * ristournePourcentage) / 100);
                    console.log(`✅ Ristourne appliquée par ce produit : ${ristournePourcentage}% -> Produits offerts : ${produitsOfferts}`);
                }
            } else {
                // Logique pour le type "générale"
                const ristournePourcentage = fournisseurExistant.conditions.ristourne;
                produitsOfferts = Math.floor((quantite * ristournePourcentage) / 100);
                console.log(`✅ Ristourne générale appliquée : ${ristournePourcentage}% -> Produits offerts : ${produitsOfferts}`);
            }
            quantiteTotale += produitsOfferts; // Ajouter les produits offerts à la quantité totale
        }

        // Création de l'achat après le calcul de la ristourne
        const nouvelAchat = new Achat({
            produit,
            fournisseur,
            quantite,
            quantiteTotale,
            prixAchat,
            total,
            panier: panierExistant._id,
            ristourneAppliquee: (fournisseurExistant.conditions.typeRistourne === "par_produit" && produitsOfferts > 0) ? parseFloat(ristourneAppliquee) : false,
            unite // Ajout de l'unité à l'achat
        });

        await nouvelAchat.save();

        // Ajouter l'achat au panier et mettre à jour le total général du panier
        panierExistant.achats.push(nouvelAchat._id);
        panierExistant.totalGeneral += total; // Mettre à jour le total général uniquement avec le montant de l'achat
        await panierExistant.save();

        // Envoyer la réponse
        res.status(201).json({ 
            message: "✅ Achat ajouté avec succès",
            achat: nouvelAchat,
            panier: panierExistant
        });

    } catch (error) {
        console.error("❌ Erreur lors de l'ajout de l'achat:", error);
        res.status(500).json({ message: "Erreur lors de l'ajout de l'achat", error: error.message });
    }
};
function convertirUnite(quantite, uniteAchat, unitesDisponibles) {
    // Trouver l'unité de départ
    const uniteSource = unitesDisponibles.find(u => u.nom === uniteAchat);

    if (!uniteSource) {
        console.error("❌ Erreur: Unité source introuvable !");
        return { quantite, unite: uniteAchat };
    }

    // Trier les unités par ordre croissant de conversion (plus petite unité a une conversion plus grande)
    const unitesTriees = [...unitesDisponibles].sort((a, b) => b.conversion - a.conversion);

    // Trouver la plus petite unité
    const uniteCible = unitesTriees[0]; // La première unité dans la liste triée est la plus petite

    // Conversion
    const nouvelleQuantite = quantite * (uniteCible.conversion / uniteSource.conversion);
    return { quantite: nouvelleQuantite, unite: uniteCible.nom };
}
exports.validerPanier = async (req, res) => {
    try {
        const { panierId } = req.params;
        const { entrepotId } = req.body;

        console.log("🔍 Validation du panier - ID du panier:", panierId, "Entrepôt:", entrepotId);

        const panier = await Panier.findById(panierId);
        if (!panier) {
            return res.status(404).json({ message: "Panier non trouvé" });
        }

        const achats = await Achat.find({ _id: { $in: panier.achats } }).populate('produit');
        if (achats.length === 0) {
            return res.status(404).json({ message: "Aucun achat trouvé pour ce panier" });
        }

        const entrepot = await Entrepot.findById(entrepotId);
        if (!entrepot) {
            return res.status(404).json({ message: "Entrepôt non trouvé" });
        }

        for (const achat of achats) {
            const prixUnitaire = achat.prixAchat || 0;

            // Conversion de la quantité avec ta fonction `convertirUnite`
            const { quantite, unite } = convertirUnite(achat.quantite, achat.unite, achat.produit.unites);

            console.log(`🛒 Produit: ${achat.produit.nom}, Achat: ${achat.quantite} ${achat.unite} ➡ Stock (converti): ${quantite} ${unite}`);

            // Ajout ou mise à jour du stock
            await ajouterOuMettreAJourStock(entrepotId, achat.produit._id, quantite, prixUnitaire, unite);
        }

        res.status(200).json({ message: "Panier validé et stock mis à jour", achats });
    } catch (error) {
        console.error("❌ Erreur lors de la validation du panier:", error);
        res.status(500).json({ message: "Erreur lors de la validation du panier", error: error.message });
    }
};




// Afficher tous les achats
exports.afficherAchats = async (req, res) => {
    try {
        const achats = await Achat.find().populate("produit fournisseur");
        res.status(200).json(achats);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des achats", error });
    }
};

// Modifier un achat
exports.modifierAchat = async (req, res) => {
    try {
        const { id } = req.params; // Récupérer l'ID de l'achat à modifier
        const { produit, fournisseur, quantite, prixAchat } = req.body; // Récupérer les nouvelles valeurs de la requête

        // Vérification des champs requis
        if (!produit || !fournisseur || !quantite || !prixAchat) {
            return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
        }

        // Vérifier que l'achat existe
        const achatExistant = await Achat.findById(id);
        if (!achatExistant) {
            return res.status(404).json({ message: "Achat non trouvé" });
        }

        // Vérification que le produit et le fournisseur existent
        const produitExistant = await Produit.findById(produit);
        if (!produitExistant) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }

        const fournisseurExistant = await Fournisseur.findById(fournisseur);
        if (!fournisseurExistant) {
            return res.status(404).json({ message: "Fournisseur non trouvé" });
        }

        // Calcul du total avec les nouvelles valeurs
        const total = quantite * prixAchat;

        // Mise à jour de l'achat
        const achatModifie = await Achat.findByIdAndUpdate(
            id, // L'ID de l'achat à modifier
            { produit, fournisseur, quantite, prixAchat, total }, // Les nouvelles données
            { new: true } // Retourne l'achat modifié
        );

        res.status(200).json({ message: "Achat modifié avec succès", achat: achatModifie });
    } catch (error) {
        console.error("Erreur lors de la modification de l'achat:", error);
        res.status(500).json({ message: "Erreur lors de la modification de l'achat", error: error.message });
    }
};

// Supprimer un achat
exports.supprimerAchat = async (req, res) => {
    try {
        const { id } = req.params; // Récupérer l'ID de l'achat à supprimer

        // Vérifier que l'achat existe
        const achatExistant = await Achat.findById(id);
        if (!achatExistant) {
            return res.status(404).json({ message: "Achat non trouvé" });
        }

        // Supprimer l'achat
        await Achat.findByIdAndDelete(id);

        // Retourner une réponse de succès
        res.status(200).json({ message: "Achat supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'achat:", error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'achat", error: error.message });
    }
};

exports.getAchatsByPanier = async (req, res) => {
    try {
        const { panierId } = req.params;

        // Vérifier si l'ID est valide
        const mongoose = require("mongoose");
        if (!mongoose.Types.ObjectId.isValid(panierId)) {
            return res.status(400).json({ message: "L'ID du panier est invalide" });
        }

        // Récupérer les achats liés au panier
        const achats = await Achat.find({ panier: panierId }).populate("produit fournisseur");

        if (!achats || achats.length === 0) {
            return res.status(404).json({ message: "Aucun achat trouvé pour ce panier" });
        }

        res.status(200).json({ achats });
    } catch (error) {
        console.error("Erreur lors de la récupération des achats :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Fonction pour obtenir les totaux d'achats triés par période
exports.getTotalAchatsParPeriode = async (req, res) => {
    try {
        const { periode } = req.params; // "journalier", "hebdomadaire", "mensuel", "annuel", "global"

        let dateDebut, dateFin;

        const maintenant = new Date();

        switch (periode) {
            case 'journalier':
                dateDebut = new Date(maintenant.setHours(0, 0, 0, 0));
                dateFin = new Date(maintenant.setHours(23, 59, 59, 999));
                break;

            case 'hebdomadaire':
                const premierJourSemaine = maintenant.getDate() - maintenant.getDay(); // Dimanche = 0
                dateDebut = new Date(maintenant.setDate(premierJourSemaine));
                dateDebut.setHours(0, 0, 0, 0);
                dateFin = new Date(maintenant.setDate(premierJourSemaine + 6));
                dateFin.setHours(23, 59, 59, 999);
                break;

            case 'mensuel':
                dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
                dateFin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);
                dateFin.setHours(23, 59, 59, 999);
                break;

            case 'annuel':
                dateDebut = new Date(maintenant.getFullYear(), 0, 1);
                dateFin = new Date(maintenant.getFullYear(), 11, 31);
                dateFin.setHours(23, 59, 59, 999);
                break;

            case 'global':
                // Pas besoin de filtre par date, on prend tout
                const tousAchats = await Achat.find();
                const totalGlobal = tousAchats.reduce((acc, achat) => acc + achat.total, 0);

                return res.status(200).json({
                    periode: 'global',
                    totalAchats: totalGlobal,
                    nombreAchats: tousAchats.length
                });

            default:
                return res.status(400).json({ message: 'Période non valide' });
        }

        // Si la période est différente de "global", on filtre par date
        const achats = await Achat.find({
            dateAchat: {
                $gte: dateDebut,
                $lte: dateFin
            }
        });

        const totalAchats = achats.reduce((acc, achat) => acc + achat.total, 0);

        res.status(200).json({
            periode,
            totalAchats,
            nombreAchats: achats.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
