const Fournisseur = require("../models/Fournisseurs");
const path = require("path");
const fs = require("fs");

// Ajouter un fournisseur
exports.ajouterFournisseur = async (req, res) => {
  try {
    const { nom, type, contact, conditions } = req.body;
    const logo = req.file ? `/uploads/logo/${req.file.filename}` : null; // URL locale de l'image

    const nouveauFournisseur = new Fournisseur({ nom, type, contact, conditions, logo });
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
    const { id } = req.params;
    let updatedData = { ...req.body };

  
    if (req.file) {
      // Récupérer l'ancien fournisseur
      const fournisseur = await Fournisseur.findById(id);
      if (!fournisseur) {
        return res.status(404).json({ message: "❌ Fournisseur non trouvé" });
      }

      // Supprimer l'ancien fichier si un nouveau est ajouté
      if (fournisseur.logo) {
        const oldLogoPath = path.join(__dirname, "../uploads/logo/", path.basename(fournisseur.logo));
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }

      // Ajouter le nouveau logo aux données à mettre à jour
      updatedData.logo = "/uploads/logo/" + req.file.filename;
    }

    // Mise à jour du fournisseur
    const fournisseurMisAJour = await Fournisseur.findByIdAndUpdate(id, updatedData, { new: true });

    res.status(200).json({
      message: "✅ Fournisseur mis à jour avec succès",
      fournisseur: fournisseurMisAJour,
    });

  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la mise à jour", error });
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
