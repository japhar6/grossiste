const Panier = require("../models/Paniers");
const Achat = require('../models/Achats');


exports.creerPanier = async (req, res) => {
    try {
        const { modePaiement, dateLimiteCredit, referencePaiement } = req.body; 

        const nouveauPanier = new Panier({
            achats: [], // Vous pouvez ajouter des achats ici si nécessaire
            totalGeneral: 0,  // Vous pouvez calculer ce total à partir des achats
            modePaiement: modePaiement || "espèce",  // Si pas précisé, valeur par défaut "espèce"
            dateLimiteCredit: modePaiement === "crédit" ? dateLimiteCredit : null, // Ajouter la date limite si crédit
            referencePaiement: (modePaiement === "virement bancaire" || modePaiement === "mobile money") ? referencePaiement : null, // Ajouter la référence si virement ou mobile money
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

