const Stock = require('../models/Stock');

// Créer ou mettre à jour un stock
exports.createOrUpdateStock = async (req, res) => {
  try {
    const { entrepot, produit, quantité, prixUnitaire, statut } = req.body;

    // Validation des données d'entrée
    if (quantité <= 0 || prixUnitaire <= 0) {
      return res.status(400).json({ message: 'La quantité et le prix unitaire doivent être supérieurs à zéro.' });
    }

    // Recherche d'un stock existant dans l'entrepôt pour ce produit
    let stock = await Stock.findOne({ entrepot, produit });

    if (stock) {
      // Si un stock existe, on met à jour la quantité et la valeurTotale
      stock.quantité += quantité;  // Ajouter la quantité à l'existant
      stock.valeurTotale = stock.quantité * stock.prixUnitaire;  // Recalcul de la valeurTotale

      // Mise à jour du stock
      await stock.save();
      res.status(200).json({ message: 'Stock mis à jour avec succès', stock });
    } else {
      // Si le stock n'existe pas, on en crée un nouveau
      const valeurTotale = quantité * prixUnitaire;

      stock = new Stock({
        entrepot,
        produit,
        quantité,
        prixUnitaire,
        valeurTotale,
        statut
      });

      await stock.save();
      res.status(201).json({ message: 'Stock créé avec succès', stock });
    }
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création ou mise à jour du stock', error });
  }
};

// Obtenir tous les stocks
exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find().populate('entrepot').populate('produit');
    res.status(200).json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des stocks', error });
  }
};

// Obtenir un stock par ID
exports.getStockById = async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id).populate('entrepot').populate('produit');
    if (!stock) {
      return res.status(404).json({ message: 'Stock non trouvé' });
    }
    res.status(200).json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du stock', error });
  }
};

// Mettre à jour un stock (mis à jour pour inclure la logique de recalcul de valeurTotale)
exports.updateStock = async (req, res) => {
  try {
    const { quantité, prixUnitaire, statut } = req.body;

    // Validation des données d'entrée
    if (quantité <= 0 || prixUnitaire <= 0) {
      return res.status(400).json({ message: 'La quantité et le prix unitaire doivent être supérieurs à zéro.' });
    }

    // Calculer la nouvelle valeurTotale
    const valeurTotale = quantité * prixUnitaire;

    // Mise à jour du stock avec la nouvelle valeurTotale
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      { quantité, prixUnitaire, statut, valeurTotale },
      { new: true }
    );

    if (!stock) {
      return res.status(404).json({ message: 'Stock non trouvé' });
    }

    res.status(200).json({ message: 'Stock mis à jour avec succès', stock });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du stock', error });
  }
};

// Supprimer un stock
exports.deleteStock = async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock non trouvé' });
    }
    res.status(200).json({ message: 'Stock supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du stock', error });
  }
};
