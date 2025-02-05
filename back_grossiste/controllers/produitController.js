const Produit = require("../models/Produits");

// Ajouter un produit
exports.ajouterProduit = async (req, res) => {
  try {
    const { nom, description, prix, quantite, categorie, unite } = req.body;

    // Vérifier si tous les champs requis sont fournis
    if (!nom || !prix || !quantite || !categorie || !unite) {
      return res.status(400).json({ message: "Tous les champs obligatoires doivent être remplis." });
    }

    const nouveauProduit = new Produit({ nom, description, prix, quantite, categorie, unite });

    await nouveauProduit.save();
    res.status(201).json({ message: "Produit ajouté avec succès", produit: nouveauProduit });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du produit", error });
  }
};

// Récupérer tous les produits
exports.afficherProduits = async (req, res) => {
    try {
      const produits = await Produit.find();
      res.status(200).json(produits);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des produits", error });
    }
  };

  // Modifier un produit
exports.modifierProduit = async (req, res) => {
    try {
      const { id } = req.params;
      const { nom, description, prix, quantite, categorie, unite } = req.body;
  
      // Vérifier si le produit existe
      const produitExistant = await Produit.findById(id);
      if (!produitExistant) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
  
      // Mettre à jour le produit
      const produitModifie = await Produit.findByIdAndUpdate(
        id,
        { nom, description, prix, quantite, categorie, unite },
        { new: true }
      );
  
      res.status(200).json({ message: "Produit modifié avec succès", produit: produitModifie });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la modification du produit", error });
    }
  };

  // Supprimer un produit
exports.supprimerProduit = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Vérifier si le produit existe
      const produitExistant = await Produit.findById(id);
      if (!produitExistant) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
  
      // Supprimer le produit
      await Produit.findByIdAndDelete(id);
      res.status(200).json({ message: "Produit supprimé avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la suppression du produit", error });
    }
  };
  
