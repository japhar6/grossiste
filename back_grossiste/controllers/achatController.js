const Achat = require("../models/Achats");
const Produit = require("../models/Produits");
const Fournisseur = require("../models/Fournisseurs");
const Panier = require("../models/Paniers");
const { ajouterOuMettreAJourStock } = require('./stockController'); 
const Stock = require('../models/Stock');
const Entrepot = require('../models/Entrepot');


// Ajouter un achat
exports.ajouterAchat = async (req, res) => {
  try {
      const { produit, fournisseur, quantite, prixAchat } = req.body;

      // Vérification des champs obligatoires
      if (!produit || !fournisseur || !quantite || !prixAchat) {
          return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
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

      // 🔹 Trouver ou créer un panier
      let panierExistant = await Panier.findOne();
      if (!panierExistant) {
          panierExistant = new Panier({
              achats: [],
              totalGeneral: 0
          });
          await panierExistant.save();
      }

      // Calculer le total de l'achat
      const total = quantite * prixAchat;

      // Création de l'achat
      const nouvelAchat = new Achat({
          produit,
          fournisseur,
          quantite,
          prixAchat,
          total,
          panier: panierExistant._id  // Lier l'achat au panier
      });

      await nouvelAchat.save();

      // Ajouter l'achat au panier et mettre à jour le total général du panier
      panierExistant.achats.push(nouvelAchat._id);
      panierExistant.totalGeneral += total;
      await panierExistant.save();

      res.status(201).json({ message: "✅ Achat ajouté avec succès", achat: nouvelAchat, panier: panierExistant });
  } catch (error) {
      console.error("❌ Erreur lors de l'ajout de l'achat:", error);
      res.status(500).json({ message: "Erreur lors de l'ajout de l'achat", error: error.message });
  }
};


exports.validerAchat = async (req, res) => {
  try {
    const { achatId } = req.params;
    const { entrepotId } = req.body;

    console.log("🔍 Validation de l'achat - ID:", achatId, "Entrepôt:", entrepotId);

    const achat = await Achat.findById(achatId).populate('produit');
    if (!achat) {
      return res.status(404).json({ message: "Achat non trouvé" });
    }

    const entrepot = await Entrepot.findById(entrepotId);
    if (!entrepot) {
      return res.status(404).json({ message: "Entrepôt non trouvé" });
    }

    // 📌 Utilisation de la fonction sans res
    const stock = await ajouterOuMettreAJourStock(entrepotId, achat.produit._id, achat.quantite, achat.prixAchat);

    res.status(200).json({ message: "Stock mis à jour après validation de l'achat", stock });

  } catch (error) {
    console.error("❌ Erreur lors de la validation de l'achat:", error);
    res.status(500).json({ message: "Erreur lors de la validation de l'achat", error: error.message });
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

