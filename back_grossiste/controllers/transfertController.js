const Transfert = require('../models/Transfert');
const Stock = require('../models/Stock'); // Assurer que ce modèle existe
const Entrepot = require('../models/Entrepot'); // Assurer que ce modèle existe
const Produit = require('../models/Produits'); // Assurer que ce modèle existe

exports.createTransfert = async (req, res) => {
  try {
    const { entrepotSource, entrepotDestination, produit, quantité } = req.body;

    // Validation des données d'entrée
    if (quantité <= 0) {
      return res.status(400).json({ message: 'La quantité doit être supérieure à zéro.' });
    }

    // Vérification des stocks dans les entrepôts
    const stockSource = await Stock.findOne({ entrepot: entrepotSource, produit });
    if (!stockSource || stockSource.quantité < quantité) {
      return res.status(400).json({ message: 'Stock insuffisant dans l\'entrepôt source.' });
    }

    // Effectuer le transfert
    const transfert = new Transfert({
      entrepotSource,
      entrepotDestination,
      produit,
      quantité,
      statut: 'en cours',  // Statut initial
    });

    await transfert.save();

    // Soustraction de la quantité dans l'entrepôt source
    stockSource.quantité -= quantité;
    await stockSource.save();

    // Trouver ou créer un stock dans l'entrepôt de destination
    let stockDestination = await Stock.findOne({ entrepot: entrepotDestination, produit });
    if (stockDestination) {
      // Si le stock existe déjà dans l'entrepôt destination, on ajoute la quantité
      stockDestination.quantité += quantité;
      await stockDestination.save();
    } else {
      // Si le stock n'existe pas, on en crée un nouveau
      stockDestination = new Stock({
        entrepot: entrepotDestination,
        produit,
        quantité,
      });
      await stockDestination.save();
    }

    // Mettre à jour le statut du transfert
    transfert.statut = 'terminé';
    await transfert.save();

    res.status(201).json({ message: 'Transfert effectué avec succès', transfert });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du transfert', error });
  }
};
