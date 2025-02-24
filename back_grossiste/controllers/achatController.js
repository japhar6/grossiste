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
        const { produit, fournisseur, quantite, prixAchat, panierId, ristourneAppliquee } = req.body;

        // Vérification de la validité des entrées
        if (isNaN(quantite) || quantite <= 0) {
            return res.status(400).json({ message: "La quantité doit être un nombre positif valide." });
        }
        if (isNaN(prixAchat) || prixAchat <= 0) {
            return res.status(400).json({ message: "Le prix d'achat doit être un nombre valide supérieur à zéro." });
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
            ristourneAppliquee: (fournisseurExistant.conditions.typeRistourne === "par_produit" && produitsOfferts > 0) ? parseFloat(ristourneAppliquee) : false
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




  



// Route pour valider un panier entier et mettre à jour le stock dans un entrepôt
exports.validerPanier = async (req, res) => {
    try {
      const { panierId } = req.params;
      const { entrepotId } = req.body;
  
      console.log("🔍 Validation du panier - ID du panier:", panierId, "Entrepôt:", entrepotId);
  
      const panier = await Panier.findById(panierId);  // Trouver le panier
      if (!panier) {
        return res.status(404).json({ message: "Panier non trouvé" });
      }
  
      const achats = await Achat.find({ _id: { $in: panier.achats } }).populate('produit');  // Trouver les achats liés au panier
      if (achats.length === 0) {
        return res.status(404).json({ message: "Aucun achat trouvé pour ce panier" });
      }
  
      const entrepot = await Entrepot.findById(entrepotId);
      if (!entrepot) {
        return res.status(404).json({ message: "Entrepôt non trouvé" });
      }
  
      // Mise à jour du stock
      for (const achat of achats) {
        await ajouterOuMettreAJourStock(entrepotId, achat.produit._id, achat.quantite, achat.prixAchat);
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