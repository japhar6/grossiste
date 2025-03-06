const Transfert = require('../models/Transfert');
const Stock = require('../models/Stock');
const Produit = require("../models/Produits");
const pusher = require('../config/pusher');
const Notification = require('../models/Notification');
const User = require('../models/User');  // Import du modèle User si nécessaire

exports.transfertProduit = async (req, res) => {
  try {
    const { entrepotSource, entrepotDestination, produit, quantité } = req.body;

    if (quantité <= 0) {
      return res.status(400).json({ message: 'La quantité doit être supérieure à zéro.' });
    }

    // Récupérer le produit à partir de la table 'Produit' en utilisant son ID
    const produitData = await Produit.findById(produit);  // Remplace "Produit" par le modèle approprié
    if (!produitData) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }

    // Vérifier le stock dans l'entrepôt source
    const stockSource = await Stock.findOne({ entrepot: entrepotSource, produit });
    if (!stockSource || stockSource.quantite < quantité) {
      return res.status(400).json({ message: "Stock insuffisant dans l'entrepôt source." });
    }

    // Réduire la quantité du stock source
    stockSource.quantite -= quantité;
    await stockSource.save();

    // Créer un nouveau transfert
    const transfert = new Transfert({
      entrepotSource,
      entrepotDestination,
      produit,
      quantitéEnvoyée: quantité,
      statutAdmin: 'en attente',
    });

    await transfert.save();

    // Récupérer l'ObjectId de l'admin
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      return res.status(404).json({ message: 'Utilisateur admin non trouvé.' });
    }

    // Notification message avec le nom du produit
    const notificationMessage = `Un transfert de ${quantité} de ${produitData.nom} est en attente de validation.`;  // Utilisation du nom du produit

    // Créer la notification dans la base de données
    const notification = new Notification({
      message: notificationMessage,
      lue: false,
      type: 'transfert-en-attente',
    });

    await notification.save();

    // Émettre un événement via Pusher avec le nom du produit
    pusher.trigger('admin-channel', 'transfert-en-attente', {
      message: notificationMessage,
      transfertId: transfert._id
    });

    res.status(201).json({ message: 'Transfert initié avec succès, en attente de validation admin.', transfert });
  } catch (error) {
    console.error("Erreur lors de l'initiation du transfert:", error);
    res.status(500).json({ message: "Erreur lors de l'initiation du transfert", error: error.message });
  }
};


exports.validerParAdmin = async (req, res) => {
  try {
    const transfert = await Transfert.findById(req.params.id);
    
    if (!transfert) {
      return res.status(404).json({ message: 'Transfert non trouvé' });
    }

    if (transfert.statutAdmin !== 'en attente') {
      return res.status(400).json({ message: 'Le transfert a déjà été traité.' });
    }

    const { statut } = req.body;

    if (statut !== 'approuvé' && statut !== 'refusé') {
      return res.status(400).json({ message: "Statut invalide. Seuls 'approuvé' ou 'refusé' sont acceptés." });
    }

    transfert.statutAdmin = statut;

    if (statut === 'refusé') {
      transfert.statutEntrepotDestination = 'refusé par admin';
    }

    await transfert.save();

    res.status(200).json({ message: `Transfert ${statut} par l’admin.`, transfert });
  } catch (error) {
    console.error("Erreur lors de la validation par l'admin:", error);
    res.status(500).json({ message: "Erreur lors de la validation par l'admin", error: error.message });
  }
};


// Route pour recevoir et terminer un transfert
exports.receptionnerEtTerminerTransfert = async (req, res) => {
  try {
    const transfert = await Transfert.findById(req.params.id);
    
    if (!transfert) {
      console.error('Transfert non trouvé');
      return res.status(404).json({ message: 'Transfert non trouvé' });
    }

    // Vérifiez si le transfert a déjà été reçu
    if (transfert.statutEntrepotDestination === 'reçu') {
      console.error('Le transfert a déjà été reçu');
      return res.status(400).json({ message: 'Le transfert a déjà été reçu.' });
    }

    // Mettez à jour le statut à "reçu"
    transfert.statutEntrepotDestination = 'reçu';
    
    // Mettez à jour la quantité reçue (par exemple, en utilisant la quantité envoyée)
    transfert.quantitéReçue = transfert.quantitéEnvoyée;

    // Trouver le produit et ses unités
    const produit = await Produit.findById(transfert.produit).populate('unites'); // Assurez-vous que 'unites' est un champ peuplé
    if (!produit) {
      console.error('Produit non trouvé');
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Trouver l'unité avec la plus grande conversion
    const uniteMinimale = produit.unites.reduce((min, unite) => {
      return (unite.conversion > min.conversion) ? unite : min;
    });

    console.log('Unité minimale trouvée:', uniteMinimale);

    // Optionnel : Vous pouvez également mettre à jour le stock dans l'entrepôt de destination
    const stockDestination = await Stock.findOne({ entrepot: transfert.entrepotDestination, produit: transfert.produit });
    if (!stockDestination) {
      console.log('Création d\'un nouveau stock pour le produit');
      // Si le stock n'existe pas, vous pouvez le créer
      await Stock.create({
        entrepot: transfert.entrepotDestination,
        produit: transfert.produit,
        quantite: transfert.quantitéReçue, // Quantité reçue
        prixUnitaire: produit.prixDachat, // Assurez-vous que prixUnitaire est disponible dans transfert
        unite: uniteMinimale.nom, 
        valeurTotale : produit.prixDachat*transfert.quantitéReçue 
      });
    } else {
      console.log('Mise à jour du stock existant');
      // Si le stock existe, mettez à jour la quantité
      stockDestination.quantite += transfert.quantitéReçue; // Ajoutez la quantité reçue
      await stockDestination.save();
    }

    // Finalisez le transfert
    await transfert.save();
    console.log('Transfert reçu et terminé avec succès:', transfert);
    res.status(200).json({ message: 'Transfert reçu et terminé avec succès.', transfert });
  } catch (error) {
    console.error("Erreur lors de la réception et de la finalisation du transfert:", error);
    res.status(500).json({ message: "Erreur lors de la réception et de la finalisation du transfert", error: error.message });
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
