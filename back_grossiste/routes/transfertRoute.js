const express = require('express');
const router = express.Router();
const Transfert = require('../models/Transfert');
const Stock = require('../models/Stock');

// Route pour transférer des produits entre entrepôts
router.post('/transfert', async (req, res) => {
  try {
    const { entrepotSource, entrepotDestination, produit, quantité, prixUnitaire } = req.body;

    // Validation des données
    if (quantité <= 0) {
      return res.status(400).json({ message: 'La quantité doit être supérieure à zéro.' });
    }

    // Vérifier le stock dans l'entrepôt source
    const stockSource = await Stock.findOne({ entrepot: entrepotSource, produit });
    if (!stockSource || stockSource.quantité < quantité) {
      return res.status(400).json({ message: 'Quantité insuffisante dans l\'entrepôt source.' });
    }

    // Réduire la quantité dans l'entrepôt source
    stockSource.quantité -= quantité;
    await stockSource.save();

    // Vérifier si le produit existe dans l'entrepôt destination
    let stockDestination = await Stock.findOne({ entrepot: entrepotDestination, produit });

    if (!stockDestination) {
      // Si le produit n'existe pas dans l'entrepôt destination, créer un nouveau stock
      stockDestination = new Stock({
        entrepot: entrepotDestination,
        produit,
        quantité,
        prixUnitaire,
        valeurTotale: quantité * prixUnitaire, // Calcul de la valeur totale
      });
    } else {
      // Sinon, ajouter la quantité et calculer la nouvelle valeur totale
      stockDestination.quantité += quantité;
      stockDestination.valeurTotale += quantité * prixUnitaire;
    }

    await stockDestination.save();

    // Créer un enregistrement de transfert
    const transfert = new Transfert({
      entrepotSource,
      entrepotDestination,
      produit,
      quantité,
    });

    await transfert.save();

    res.status(201).json({
      message: 'Transfert effectué avec succès',
      transfert,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du transfert entre entrepôts', error });
  }
});


router.put('/terminer/:id', async (req, res) => {
    try {
      // Récupérer l'ID du transfert
      const transfertId = req.params.id;
  
      // Trouver le transfert par son ID
      const transfert = await Transfert.findById(transfertId);
  
      if (!transfert) {
        return res.status(404).json({ message: 'Transfert non trouvé' });
      }
  
      // Changer le statut du transfert en "terminé"
      transfert.statut = 'terminé';
  
      // Enregistrer les modifications
      await transfert.save();
  
      res.status(200).json({ message: 'Statut du transfert mis à jour avec succès', transfert });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error });
    }
  });

module.exports = router;
