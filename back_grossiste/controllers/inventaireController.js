const Inventaire = require('../models/Inventaire');
const Stock = require('../models/Stock');
exports.createInventaire = async (req, res) => {
  try {
      const { entrepot, produit, quantiteInitiale, quantiteFinale, raisonAjustement,personneId } = req.body;

      
      // Création de l'inventaire
      const inventaire = new Inventaire({
          entrepot,
          produit,
          quantitéInitiale: quantiteInitiale,
          quantitéFinale: quantiteFinale,
          raisonAjustement,
          personneId
      });

      await inventaire.save();

      // Logique d'ajustement du stock
      if (quantiteFinale < quantiteInitiale) {
          const stock = await Stock.findOne({ entrepot, produit });
          if (stock) {
              stock.quantité -= (quantiteInitiale - quantiteFinale);
              await stock.save();
          } else {
             
          }
      }

      res.status(201).json({ success: true, message: 'Inventaire enregistré et stock ajusté', inventaire });
  } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'inventaire:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement de l\'inventaire', error });
  }
};


// Récupérer tous les inventaires
exports.getAllInventaires = async (req, res) => {
  try {
    const inventaires = await Inventaire.find().populate('entrepot').populate('produit');
    res.status(200).json(inventaires);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des inventaires', error });
  }
};
exports.getEntrepotBym = async (req, res) => {
  try {
    const { personneId } = req.params;
    const inventaires = await Inventaire.find({ personneId })
      .populate("personneId", "nom email")
      .populate("produit"); // Ajoutez ceci pour peupler le produit

    if (inventaires.length === 0) {
      return res.status(404).json({ message: "❌ Aucun inventaire trouvé." });
    }

    res.status(200).json(inventaires);
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la récupération des inventaires.", error });
  }
};


// Récupérer un inventaire par ID
exports.getInventaireById = async (req, res) => {
  try {
    const inventaire = await Inventaire.findById(req.params.id).populate('entrepot').populate('produit');
    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire non trouvé' });
    }
    res.status(200).json(inventaire);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'inventaire', error });
  }
};

// Mettre à jour un inventaire par ID
exports.updateInventaire = async (req, res) => {
  try {
    const { quantitéInitiale, quantitéFinale, raisonAjustement } = req.body;

    // Validation des données d'entrée
    if (quantitéInitiale < 0 || quantitéFinale < 0) {
      return res.status(400).json({ message: 'Les quantités doivent être supérieures ou égales à zéro.' });
    }

    // Trouver l'inventaire par ID
    const inventaire = await Inventaire.findById(req.params.id);
    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire non trouvé' });
    }

    // Mise à jour des quantités et raison d'ajustement
    inventaire.quantitéInitiale = quantitéInitiale || inventaire.quantitéInitiale;
    inventaire.quantitéFinale = quantitéFinale || inventaire.quantitéFinale;
    inventaire.raisonAjustement = raisonAjustement || inventaire.raisonAjustement;

    // Sauvegarder l'inventaire mis à jour
    await inventaire.save();

    // Ajuster le stock si la quantité finale a changé
    const stock = await Stock.findOne({ entrepot: inventaire.entrepot, produit: inventaire.produit });
    if (stock) {
      stock.quantité += inventaire.quantitéInitiale - inventaire.quantitéFinale;  // Réajuster la quantité du stock
      await stock.save();
    }

    res.status(200).json({ message: 'Inventaire mis à jour avec succès', inventaire });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'inventaire', error });
  }
};

// Supprimer un inventaire par ID
exports.deleteInventaire = async (req, res) => {
  try {
    const inventaire = await Inventaire.findByIdAndDelete(req.params.id);
    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire non trouvé' });
    }
    res.status(200).json({ message: 'Inventaire supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'inventaire', error });
  }
};
