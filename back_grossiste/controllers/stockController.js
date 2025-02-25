const Stock = require('../models/Stock');
const Commande = require('../models/Commandes');
const PaiementCommerciale = require("../models/PaimentCommerciale");
const Produit = require("../models/Produits"); 
const Entrepot = require('../models/Entrepot');
// Fonction réutilisable pour créer ou mettre à jour un stock
// Fonction réutilisable pour créer ou mettre à jour un stock
exports.ajouterOuMettreAJourStock = async (entrepot, produit, quantité, prixUnitaire) => {
  try {
    if (quantité <= 0 || prixUnitaire <= 0) {
      throw new Error('La quantité et le prix unitaire doivent être supérieurs à zéro.');
    }

    let stock = await Stock.findOne({ entrepot, produit });

    if (stock) {
      stock.quantité += quantité;
    } else {
      stock = new Stock({ entrepot, produit, quantité, prixUnitaire });
    }

    // Calculer la valeur totale
    stock.valeurTotale = stock.quantité * stock.prixUnitaire;
    await stock.save();

    return stock;
  } catch (error) {
    throw new Error('Erreur lors de la mise à jour du stock: ' + error.message);
  }
};
exports.getQuantiteProduitById = async (req, res) => {
  const { id } = req.params; // Récupérer l'ID du produit depuis les paramètres de la requête

  try {
    // Récupérer l'entrepôt "principal"
    const entrepotPrincipale = await Entrepot.findOne({ type: 'principal' });
    if (!entrepotPrincipale) {
      return res.status(404).json({ message: "Entrepôt 'principal' non trouvé" });
    }

    // Récupérer le produit par ID
    const produit = await Produit.findById(id);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Récupérer les données de stock pour l'entrepôt "principal"
    const stockData = await Stock.findOne({ entrepot: entrepotPrincipale._id, produit: id });
    const quantiteDisponible = stockData ? stockData.quantité : 0; // Si aucun stock, mettre 0

    // Ajouter la quantité disponible au produit
    const produitAvecQuantite = {
      ...produit.toObject(),
      quantiteDisponible
    };

    res.json(produitAvecQuantite); // Renvoyer le produit avec sa quantité
  } catch (error) {
    console.error('Erreur lors de la récupération du produit et de sa quantité:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
} ;
exports.getQuantiteProduitByIde = async (req, res) => {
  const { id } = req.params; // Récupérer l'ID du produit depuis les paramètres de la requête

  try {
    // Récupérer le produit par ID
    const produit = await Produit.findById(id);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Récupérer l'entrepôt "principal"
    const entrepotPrincipale = await Entrepot.findOne({ type: 'principal' });
    if (!entrepotPrincipale) {
      return res.status(404).json({ message: "Entrepôt 'principal' non trouvé" });
    }

    // Récupérer les stocks pour le produit dans tous les entrepôts sauf l'entrepôt principal
    const stockData = await Stock.find({ produit: id, entrepot: { $ne: entrepotPrincipale._id } });

    // Trouver la quantité maximale parmi les stocks secondaires
    const quantiteMaximale = stockData.reduce((max, stock) => {
      return Math.max(max, stock.quantité);
    }, 0);

    // Ajouter la quantité maximale au produit
    const produitAvecQuantite = {
      ...produit.toObject(),
      quantiteDisponible: quantiteMaximale
    };

    res.json(produitAvecQuantite); // Renvoyer le produit avec sa quantité maximale
  } catch (error) {
    console.error('Erreur lors de la récupération du produit et de sa quantité:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
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
exports.retournerProduits = async (req, res) => {
  try {
    const { id } = req.params;  // ID du paiement commercial
    const { produitsRetournes, entrepotId } = req.body;  // Liste des produits retournés et l'ID de l'entrepôt

    if (!entrepotId) {
      return res.status(400).json({ message: "Entrepôt non spécifié" });
    }

    const paiementCommerciale = await PaiementCommerciale.findById(id);
    if (!paiementCommerciale) {
      return res.status(404).json({ message: "Paiement commercial non trouvé" });
    }

    // Parcours de la liste des produits retournés
    for (const produit of produitsRetournes) {
      const stockProduit = await Stock.findOne({
        entrepot: entrepotId,  // On vérifie l'entrepôt spécifié dans la requête
        produit: produit.produit,
      });

      if (!stockProduit) {
        return res.status(404).json({ message: `Produit ${produit.produit} non trouvé dans cet entrepôt` });
      }

      // Mettre à jour le stock
      stockProduit.quantité += produit.quantite;
      await stockProduit.save();


    }

    // Sauvegarder les mises à jour du paiement
    await paiementCommerciale.save();

    return res.status(200).json({ message: "Retour de produits effectué et paiement ajusté", paiementCommerciale });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.sortirProduitsStock = async (req, res) => {
  try {
    const { commandeId } = req.params;
    const { entrepotId } = req.body;  // On attend l'ID de l'entrepôt dans le corps de la requête

    if (!entrepotId) {
      return res.status(400).json({ message: "Entrepôt non spécifié" });
    }

    const commande = await Commande.findById(commandeId).populate('produits.produit');

    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // Vérification de la disponibilité des produits dans le stock
    for (let item of commande.produits) {
      const stock = await Stock.findOne({ produit: item.produit._id, entrepot: entrepotId });

      console.log(`Vérification du stock pour le produit ${item.produit._id} dans l'entrepôt ${entrepotId}`);
      console.log("Stock trouvé :", stock);

      if (!stock) {
        return res.status(400).json({ message: `Pas de stock trouvé pour le produit ${item.produit.nom} dans cet entrepôt` });
      }

      if (stock.quantité < item.quantite) {
        return res.status(400).json({ message: `Pas assez de stock pour le produit ${item.produit.nom}` });
      }
    }

    // Sortie des produits et mise à jour du stock
    for (let item of commande.produits) {
      const stock = await Stock.findOne({ produit: item.produit._id, entrepot: entrepotId });

      stock.quantité -= item.quantite;

      if (stock.quantité < 0) {
        return res.status(400).json({ message: "Stock insuffisant" });
      }

      await stock.save();
    }

    // Mettre à jour le statut de la commande
    commande.statut = 'livrée';
    await commande.save();

    return res.status(200).json({ message: "Produits sortis et stock mis à jour avec succès", commande });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

exports.getStocksByEntrepot = async (req, res) => {
  try {
      const { entrepotId } = req.params;
      const stocks = await Stock.find({ entrepot: entrepotId }).populate('produit');

      res.status(200).json(stocks);
  } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des stocks", error });
  }
};