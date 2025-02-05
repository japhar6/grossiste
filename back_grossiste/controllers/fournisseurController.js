const Fournisseur = require("../models/Fournisseurs");

// Ajouter un fournisseur
exports.ajouterFournisseur = async (req, res) => {
  try {
    const { nom, type, contact, conditions } = req.body;
    const nouveauFournisseur = new Fournisseur({ nom, type, contact, conditions });
    await nouveauFournisseur.save();
    res.status(201).json({ message: "✅ Fournisseur ajouté avec succès", fournisseur: nouveauFournisseur });
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de l'ajout du fournisseur", error });
  }
};

// Récupérer tous les fournisseurs
exports.getFournisseurs = async (req, res) => {
  try {
    const fournisseurs = await Fournisseur.find();
    res.status(200).json(fournisseurs);
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la récupération des fournisseurs", error });
  }
};

// Récupérer un fournisseur par ID
exports.getFournisseurById = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);
    if (!fournisseur) return res.status(404).json({ message: "⚠️ Fournisseur non trouvé" });
    res.status(200).json(fournisseur);
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la récupération du fournisseur", error });
  }
};

// Mettre à jour un fournisseur
exports.updateFournisseur = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!fournisseur) return res.status(404).json({ message: "⚠️ Fournisseur non trouvé" });
    res.status(200).json({ message: "✅ Fournisseur mis à jour avec succès", fournisseur });
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la mise à jour du fournisseur", error });
  }
};

// Supprimer un fournisseur
exports.deleteFournisseur = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findByIdAndDelete(req.params.id);
    if (!fournisseur) return res.status(404).json({ message: "⚠️ Fournisseur non trouvé" });
    res.status(200).json({ message: "✅ Fournisseur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la suppression du fournisseur", error });
  }
};
