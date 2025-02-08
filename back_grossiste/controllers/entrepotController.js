const Entrepot = require("../models/Entrepot");

// 🔹 Ajouter un nouvel entrepôt
exports.createEntrepot = async (req, res) => {
  try {
    const { nom, localisation, magasinier, type } = req.body;

    // Vérifier si un entrepôt du même nom existe déjà
    const existingEntrepot = await Entrepot.findOne({ nom });
    if (existingEntrepot) {
      return res.status(400).json({ message: "❌ Cet entrepôt existe déjà." });
    }

    const newEntrepot = new Entrepot({
      nom,
      localisation,
      magasinier,
      type,
    });

    await newEntrepot.save();
    res.status(201).json({ message: "✅ Entrepôt créé avec succès.", entrepot: newEntrepot });

  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la création de l'entrepôt.", error });
  }
};

// 🔹 Récupérer tous les entrepôts
exports.getAllEntrepots = async (req, res) => {
  try {
    const entrepots = await Entrepot.find().populate("magasinier", "nom email photo ");
    res.status(200).json(entrepots);
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la récupération des entrepôts.", error });
  }
};

// 🔹 Récupérer un entrepôt par ID
exports.getEntrepotById = async (req, res) => {
  try {
    const entrepot = await Entrepot.findById(req.params.id).populate("magasinier", "nom email");
    if (!entrepot) {
      return res.status(404).json({ message: "❌ Entrepôt non trouvé." });
    }
    res.status(200).json(entrepot);
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la récupération de l'entrepôt.", error });
  }
};

// 🔹 Mettre à jour un entrepôt
exports.updateEntrepot = async (req, res) => {
  try {
    const { nom, localisation, magasinier, type } = req.body;

    const updatedEntrepot = await Entrepot.findByIdAndUpdate(
      req.params.id,
      { nom, localisation, magasinier, type },
      { new: true }
    );

    if (!updatedEntrepot) {
      return res.status(404).json({ message: "❌ Entrepôt non trouvé." });
    }

    res.status(200).json({ message: "✅ Entrepôt mis à jour avec succès.", entrepot: updatedEntrepot });

  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la mise à jour de l'entrepôt.", error });
  }
};

// 🔹 Supprimer un entrepôt
exports.deleteEntrepot = async (req, res) => {
  try {
    const deletedEntrepot = await Entrepot.findByIdAndDelete(req.params.id);

    if (!deletedEntrepot) {
      return res.status(404).json({ message: "❌ Entrepôt non trouvé." });
    }

    res.status(200).json({ message: "✅ Entrepôt supprimé avec succès." });

  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la suppression de l'entrepôt.", error });
  }
};
