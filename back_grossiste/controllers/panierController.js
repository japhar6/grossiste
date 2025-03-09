const Panier = require("../models/Paniers");
const Achat = require('../models/Achats');
const FondRistourne = require('../models/FondRistourne'); // Respecte la casse



exports.creerPanier = async (req, res) => {
    try {
        const { modePaiement, dateLimiteCredit, referencePaiement } = req.body; 

        const nouveauPanier = new Panier({
            achats: [], // Vous pouvez ajouter des achats ici si nécessaire
            totalGeneral: 0,  // Vous pouvez calculer ce total à partir des achats
            totalRistourne: 0, 
            modePaiement: modePaiement || "espèce",  // Si pas précisé, valeur par défaut "espèce"
            dateLimiteCredit: modePaiement === "crédit" ? dateLimiteCredit : null, // Ajouter la date limite si crédit
            referencePaiement: (modePaiement === "virement bancaire" || modePaiement === "mobile money" || modePaiement === "versement") ? referencePaiement : null, // Ajouter la référence si virement ou mobile money
            statut: "non payé" // Par défaut, le panier est non payé
        });

        await nouveauPanier.save();
        res.status(201).json({ message: "Panier créé avec succès", panier: nouveauPanier });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création du panier", error: error.message });
    }
};

exports.getAllPaniers = async (req, res) => {
    try {
        const paniers = await Panier.find().populate("achats");
       
        res.status(200).json({ paniers });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des paniers", error });
    }
};
exports.modifierStatutPanier = async (req, res) => {
    const panierId = req.params.id; // L'ID du panier dans l'URL
    const { statut, appliquerRistourne } = req.body; // Statut et confirmation de ristourne
  
    try {
        // Trouver le panier
        const panier = await Panier.findById(panierId).populate("fournisseur"); 
        if (!panier) {
            return res.status(404).json({ message: "Panier non trouvé" });
        }

        // Modifier le statut et le mode de paiement
        panier.statut = statut;
        panier.modePaiement = "espèce";

        // Vérifier s'il y a un FondRistourne lié au fournisseur du panier
        if (panier.fournisseur) {
            const fondRistourne = await FondRistourne.findOne({ fournisseur: panier.fournisseur });

            if (fondRistourne && fondRistourne.montantRistourne > 0) {
                // Vérification si l'utilisateur veut appliquer la ristourne
                if (appliquerRistourne) {
                    const ristourneAUtiliser = Math.min(fondRistourne.montantRistourne, panier.totalGeneral);
                    panier.totalGeneral -= ristourneAUtiliser;

                    console.log(`💰 Ristourne appliquée: ${ristourneAUtiliser}, Nouveau total général: ${panier.totalGeneral}`);

                     // Supprimer complètement le FondRistourne après utilisation
                     await FondRistourne.findByIdAndDelete(fondRistourne._id);
                     console.log("🗑️ FondRistourne supprimé après utilisation.");
                } else {
                    console.log("❗ Ristourne détectée, mais non appliquée.");
                }
            }
        }

        // Sauvegarder les modifications
        await panier.save();

        // Retourner la réponse
        res.status(200).json({ message: "Statut du panier modifié avec succès", panier });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la modification du statut du panier" });
    }
};

exports.supprimerPanier = async (req, res) => {
    try {
        const { panierId } = req.params;
        const panier = await Panier.findById(panierId);

        if (!panier) {
            return res.status(404).json({ message: "Panier non trouvé" });
        }

        await Panier.findByIdAndDelete(panierId);
        res.status(200).json({ message: "Panier supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du panier", error });
    }
};

exports.getPanierById = async (req, res) => {
    try {
      const { panierId } = req.params;
      const panier = await Panier.findById(panierId);
  
      if (!panier) {
        return res.status(404).json({ message: "Panier non trouvé" });
      }
  
      res.status(200).json(panier);
    } catch (error) {
      console.error("Erreur lors de la récupération du panier :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };

  exports.historiquePanier = async (req, res) => {
    try {
        // Récupérer modePaiement depuis les paramètres de l'URL
        const { modePaiement } = req.params;

        // Vérification que le mode de paiement est valide
        if (!modePaiement) {
            return res.status(400).json({ message: "Le mode de paiement est requis" });
        }

        // Recherche des paniers avec le mode de paiement spécifié
        const paniers = await Panier.find({ modePaiement })
            .populate({
                path: 'achats',  // Peuplage des achats dans le panier
                populate: {
                    path: 'produit',  // Peuplage des produits associés à chaque achat
                    model: 'Produit'
                }
            })
            .populate({
                path: 'achats',  
                populate: [
                    { path: 'produit', model: 'Produit' },  // Peuplage des produits associés à chaque achat
                    { path: 'fournisseur', model: 'Fournisseur', select: 'nom' }  // Peuplage du fournisseur
                ]
            })
            
            
            .populate({path :'fournisseur',
                select :'nom type'
            });

        // Si aucun panier n'est trouvé, retournez un message d'erreur
        if (paniers.length === 0) {
            return res.status(404).json({ message: `Aucun panier trouvé avec le mode de paiement ${modePaiement}` });
        }

        // Si des paniers ont été trouvés, retournez-les dans la réponse
        res.status(200).json({
            message: `Historique des paniers avec mode de paiement ${modePaiement}`,
            paniers
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des paniers:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des paniers", error: error.message });
    }
};

exports.getTotalPaniersParPeriode = async (req, res) => {
    try {
        const { periode } = req.params; // "journalier", "hebdomadaire", "mensuel", "annuel", "global"

        let dateDebut, dateFin;
        const maintenant = new Date();

        switch (periode) {
            case 'journalier':
                dateDebut = new Date(maintenant);
                dateDebut.setHours(0, 0, 0, 0);
                dateFin = new Date(maintenant);
                dateFin.setHours(23, 59, 59, 999);
                break;

            case 'hebdomadaire':
                dateDebut = new Date(maintenant);
                dateDebut.setDate(maintenant.getDate() - maintenant.getDay()); // Lundi
                dateDebut.setHours(0, 0, 0, 0);

                dateFin = new Date(dateDebut);
                dateFin.setDate(dateDebut.getDate() + 6); // Dimanche
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
                // Récupérer uniquement les paniers payés
                const totalGlobal = await Panier.aggregate([
                    { $match: { statut: "payé" } },
                    { $group: { _id: null, total: { $sum: "$totalGeneral" }, count: { $sum: 1 } } }
                ]);

                return res.status(200).json({
                    periode: 'global',
                    totalPaniers: totalGlobal[0]?.total || 0,
                    nombrePaniers: totalGlobal[0]?.count || 0
                });

            default:
                return res.status(400).json({ message: 'Période non valide' });
        }

        // Récupérer les paniers payés dans la période donnée
        const totalParPeriode = await Panier.aggregate([
            {
                $match: {
                    dateAchat: { $gte: dateDebut, $lte: dateFin },
                    statut: "payé"
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalGeneral" },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            periode,
            totalPaniers: totalParPeriode[0]?.total || 0,
            nombrePaniers: totalParPeriode[0]?.count || 0
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
