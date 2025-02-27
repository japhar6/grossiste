const Transfert = require('../models/Transfert');
const Stock = require('../models/Stock');

// 1️⃣ Création d'un transfert par l'entrepôt source
exports.transfertProduit = async (req, res) => {
  try {
    const { entrepotSource, entrepotDestination, produit, quantité, prixUnitaire } = req.body;

    if (quantité <= 0) {
      return res.status(400).json({ message: 'La quantité doit être supérieure à zéro.' });
    }

    // Vérifier le stock dans l'entrepôt source
    const stockSource = await Stock.findOne({ entrepot: entrepotSource, produit });
    if (!stockSource || stockSource.quantité < quantité) {
      return res.status(400).json({ message: "Stock insuffisant dans l'entrepôt source." });
    }

    // Réduire le stock dans l'entrepôt source
    stockSource.quantité -= quantité;
    await stockSource.save();

    // Créer un transfert avec statut en attente d'approbation admin
    const transfert = new Transfert({
      entrepotSource,
      entrepotDestination,
      produit,
      quantitéEnvoyée: quantité,
      statutAdmin: 'en attente',
    });

    await transfert.save();
    res.status(201).json({ message: 'Transfert initié avec succès, en attente de validation admin.', transfert });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'initiation du transfert", error });
  }
};

exports.validerParAdmin = async (req, res) => {
  try {
    const transfert = await Transfert.findById(req.params.id);
    
    if (!transfert) {
      return res.status(404).json({ message: 'Transfert non trouvé' });
    }

    // Vérifiez si le transfert a déjà été validé
    if (transfert.statutAdmin !== 'en attente') {
      return res.status(400).json({ message: 'Le transfert a déjà été traité.' });
    }

    // Mettez à jour le statut sans valider la quantité
    transfert.statutAdmin = 'approuvé';
    
    await transfert.save();

    res.status(200).json({ message: 'Transfert approuvé par l’admin.', transfert });
  } catch (error) {
    console.error("Erreur lors de la validation par l'admin:", error);
    res.status(500).json({ message: "Erreur lors de la validation par l'admin", error });
  }
};


// 3️⃣ Réception et validation par l'entrepôt destinataire
exports.receptionnerTransfert = async (req, res) => {
  try {
    const { quantitéReçue, quantitéPerdue, quantitéEndommagée, commentaire } = req.body;

    const transfert = await Transfert.findById(req.params.id);
    if (!transfert) {
      return res.status(404).json({ message: 'Transfert non trouvé' });
    }
    
    if (transfert.statutAdmin !== 'approuvé') {
      return res.status(400).json({ message: "Le transfert n'a pas encore été approuvé par l'admin." });
    }

    // Vérifier si la quantité reçue est correcte
    if (quantitéReçue + quantitéPerdue + quantitéEndommagée !== transfert.quantitéEnvoyée) {
      return res.status(400).json({ message: "La somme des quantités ne correspond pas à la quantité envoyée." });
    }

    // Mise à jour des informations de réception
    transfert.quantitéReçue = quantitéReçue;
    transfert.quantitéPerdue = quantitéPerdue;
    transfert.quantitéEndommagée = quantitéEndommagée;
    transfert.commentaireEntrepotDestination = commentaire;
    transfert.statutEntrepotDestination = 'reçu';

    await transfert.save();

    // Mise à jour du stock de l'entrepôt de destination
    let stockDestination = await Stock.findOne({ entrepot: transfert.entrepotDestination, produit: transfert.produit });

    if (!stockDestination) {
      stockDestination = new Stock({
        entrepot: transfert.entrepotDestination,
        produit: transfert.produit,
        quantité: quantitéReçue,
      });
    } else {
      stockDestination.quantité += quantitéReçue;
    }

    await stockDestination.save();

    res.status(200).json({ message: 'Transfert reçu et enregistré.', transfert });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la réception du transfert', error });
  }
};

// 4️⃣ Terminer un transfert (statut "terminé")
exports.terminerTransfert = async (req, res) => {
  try {
    const transfert = await Transfert.findById(req.params.id);
    if (!transfert) {
      return res.status(404).json({ message: 'Transfert non trouvé' });
    }

    if (transfert.statutEntrepotDestination !== 'reçu') {
      return res.status(400).json({ message: "Le transfert ne peut pas être terminé car il n'a pas encore été validé par l'entrepôt de destination." });
    }

    transfert.statut = 'terminé';
    await transfert.save();

    res.status(200).json({ message: 'Transfert terminé avec succès.', transfert });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error });
  }
};

// 5️⃣ Récupérer les transferts avec filtres
exports.recuperer = async (req, res) => {
  try {
    const { entrepotSource, statutAdmin, statutEntrepotDestination } = req.query;

    let filtre = {};
    if (entrepotSource) {
      filtre.entrepotSource = entrepotSource;
    }
    if (statutAdmin) {
      filtre.statutAdmin = statutAdmin;
    }
    if (statutEntrepotDestination) {
      filtre.statutEntrepotDestination = statutEntrepotDestination;
    }

    // Exclure les transferts sans produit ou sans entrepôt de destination
    filtre.produit = { $ne: null };
    filtre.entrepotDestination = { $ne: null };

    const transferts = await Transfert.find(filtre)
      .populate("produit")
      .populate("entrepotSource")
      .populate("entrepotDestination");

    res.status(200).json(transferts);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la récupération des transferts", error });
  }
};
