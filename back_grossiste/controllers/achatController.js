const Achat = require("../models/Achats");
const Produit = require("../models/Produits");
const Fournisseur = require("../models/Fournisseurs");

// Ajouter un achat
exports.ajouterAchat = async (req, res) => {
  try {
    const { produit, fournisseur, quantite, prixAchat } = req.body;

    if (!produit || !fournisseur || !quantite || !prixAchat) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
    }

    const produitExistant = await Produit.findById(produit);
    if (!produitExistant) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    const fournisseurExistant = await Fournisseur.findById(fournisseur);
    if (!fournisseurExistant) {
      return res.status(404).json({ message: "Fournisseur non trouvé" });
    }

    // Calculer le total de l'achat
    const total = quantite * prixAchat;

    // Création de l'achat
    const nouvelAchat = new Achat({ produit, fournisseur, quantite, prixAchat, total });

    await nouvelAchat.save();
    res.status(201).json({ message: "Achat ajouté avec succès", achat: nouvelAchat });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'achat:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de l'achat", error: error.message });
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

