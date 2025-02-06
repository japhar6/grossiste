const Stock = require('../models/Stock');

// Fonction réutilisable pour créer ou mettre à jour un stock
exports.ajouterOuMettreAJourStock = async (entrepot, produit, quantité, prixUnitaire) => {
  try {
    if (quantité <= 0 || prixUnitaire <= 0) {
      throw new Error('La quantité et le prix unitaire doivent être supérieurs à zéro.');
    }

    let stock = await Stock.findOne({ entrepot, produit });

    if (stock) {
      stock.quantité += quantité;
      stock.valeurTotale = stock.quantité * stock.prixUnitaire;
      await stock.save();
    } else {
      const valeurTotale = quantité * prixUnitaire;
      stock = new Stock({ entrepot, produit, quantité, prixUnitaire, valeurTotale });
      await stock.save();
    }

    return stock;
  } catch (error) {
    throw new Error('Erreur lors de la mise à jour du stock: ' + error.message);
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
