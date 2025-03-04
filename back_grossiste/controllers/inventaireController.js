const Inventaire = require('../models/Inventaire');
const Stock = require('../models/Stock');

exports.createInventaire = async (req, res) => {
  try {
      const { entrepot, produit, quantiteInitiale, quantiteFinale, raisonAjustement, personneId } = req.body;

      // Récupérer le stock pour le produit sélectionné et peupler les informations du produit
      const stock = await Stock.findOne({ entrepot, produit }).populate('produit');

      if (!stock) {
          return res.status(404).json({ success: false, message: 'Produit non trouvé dans le stock' });
      }

      // Récupérer les informations complètes du produit
      const produitDetails = stock.produit; // stock contient l'objet produit

      if (!produitDetails) {
          return res.status(404).json({ success: false, message: 'Détails du produit non trouvés' });
      }

      // Vérification de l'existence de prixDachat dans le produit
      const prixDachat = produitDetails.prixDachat;
      if (prixDachat === undefined || prixDachat === null) {
          return res.status(400).json({ success: false, message: 'Le prix d\'achat du produit est manquant' });
      }

      // Calcul du nombre d'inventaire
      const nombreInventaire = quantiteInitiale - quantiteFinale ;

      // Calcul du prix de l'inventaire (prixDachat * nombreInventaire)
      const prixInventaire = prixDachat * nombreInventaire;

      // Création de l'inventaire
      const inventaire = new Inventaire({
          entrepot,
          produit,
          quantitéInitiale: quantiteInitiale,
          quantitéFinale: quantiteFinale,
          raisonAjustement,
          personneId,
          nombreInventaire,  
          prixInventaire     
      });

      await inventaire.save();

      // Logique d'ajustement du stock
      if (quantiteFinale < quantiteInitiale) {
          stock.quantite -= (quantiteInitiale - quantiteFinale);
          await stock.save();
      }

      res.status(201).json({
          success: true,
          message: 'Inventaire enregistré et stock ajusté',
          inventaire: {
              ...inventaire.toObject(),
              nombreInventaire,
              prixInventaire
          }
      });
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

exports.getTotalInventaireParPeriode = async (req, res) => {
  try {
      const { periode } = req.params;

      let dateDebut, dateFin;

      const maintenant = new Date();

      switch (periode) {
          case 'journalier':
              dateDebut = new Date(maintenant.setHours(0, 0, 0, 0));
              dateFin = new Date(maintenant.setHours(23, 59, 59, 999));
              break;

          case 'hebdomadaire':
              const premierJourSemaine = maintenant.getDate() - maintenant.getDay();
              dateDebut = new Date(maintenant.setDate(premierJourSemaine));
              dateDebut.setHours(0, 0, 0, 0);
              dateFin = new Date(maintenant.setDate(premierJourSemaine + 6));
              dateFin.setHours(23, 59, 59, 999);
              break;

          case 'mensuel':
              dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
              dateFin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);
              dateFin.setHours(23, 59, 59, 999);
              break;

          case 'annuel':
              dateDebut = new Date(maintenant.getFullYear(), 0, 1);
              dateFin = new Date(maintenant.getFullYear(), 11, 31);
              dateFin.setHours(23, 59, 59, 999);
              break;

          case 'global':
              const tousInventaires = await Inventaire.find();
              const totalGlobalNombre = tousInventaires.reduce((acc, inv) => acc + inv.nombreInventaire, 0);
              const totalGlobalPrix = tousInventaires.reduce((acc, inv) => acc + inv.prixInventaire, 0);

              return res.status(200).json({
                  periode: 'global',
                  totalNombreInventaire: totalGlobalNombre,
                  totalPrixInventaire: totalGlobalPrix,
                  nombreOperations: tousInventaires.length
              });

          default:
              return res.status(400).json({ message: 'Période non valide' });
      }

      const inventaires = await Inventaire.find({
          dateInventaire: {
              $gte: dateDebut,
              $lte: dateFin
          }
      });

      const totalNombreInventaire = inventaires.reduce((acc, inv) => acc + inv.nombreInventaire, 0);
      const totalPrixInventaire = inventaires.reduce((acc, inv) => acc + inv.prixInventaire, 0);

      res.status(200).json({
          periode,
          totalNombreInventaire,
          totalPrixInventaire,
          nombreOperations: inventaires.length
      });

  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
  }
};

