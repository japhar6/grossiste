const Stock = require('../models/Stock');
const Commande = require('../models/Commandes');
const PaiementCommerciale = require("../models/PaimentCommerciale");
const Produit = require("../models/Produits");
const Entrepot = require('../models/Entrepot');
const mongoose = require('mongoose');


// Fonction réutilisable pour créer ou mettre à jour un stock
exports.ajouterOuMettreAJourStock = async (entrepotId, produitId, quantiteAjoutee, prixAchat, unite) => {
  try {
    console.log(`📦 Mise à jour du stock: Produit ${produitId}, quantite: ${quantiteAjoutee}, Prix Achat: ${prixAchat}`);

    if (!quantiteAjoutee || isNaN(quantiteAjoutee) || quantiteAjoutee <= 0) {
      throw new Error(`❌ quantite invalide (${quantiteAjoutee})`);
    }

    if (!prixAchat || isNaN(prixAchat)) {
      throw new Error(`❌ Prix d'achat invalide (${prixAchat})`);
    }

    let stock = await Stock.findOne({ produit: produitId, entrepot: entrepotId });
    console.log("🔎 Stock trouvé dans la base ?", stock);

    if (stock) {
      console.log("🛠 Mise à jour du stock existant");
      stock.quantite += quantiteAjoutee;  // Correction ici (supprimer l'accent)
      stock.valeurTotale = stock.quantite * prixAchat;
    } else {
      console.log("🆕 Création d'un nouveau stock");
      stock = new Stock({
        produit: produitId,
        entrepot: entrepotId,
        quantite: quantiteAjoutee,  // Correction ici (supprimer l'accent)
        prixUnitaire: prixAchat,
        valeurTotale: quantiteAjoutee * prixAchat,
        unite: unite
      });
    }

    console.log("📤 Objet stock avant sauvegarde:", stock);

    await stock.save();
    console.log(`✅ Stock mis à jour: ${stock.quantite} unités`);

  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du stock:", error);
    throw error;
  }
};
exports.getQuantiteProduitById = async (req, res) => {
  const { id } = req.params; // Récupérer l'ID du produit depuis les paramètres de la requête

  try {
    // Récupérer le produit par ID
    const produit = await Produit.findById(id);
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Parcourir les stocks pour trouver le produit dans les entrepôts
    const stockData = await Stock.find({ produit: id }).populate('entrepot'); // Récupère tous les stocks du produit avec les informations de l'entrepôt

    // Si aucun stock n'est trouvé pour ce produit
    if (stockData.length === 0) {
      return res.status(200).json({ quantiteDisponible: 0, message: "Produit non trouvé dans aucun stock" });
    }

    // Parcours des stocks pour identifier l'entrepôt principal
    let entrepotPrincipale = null;
    for (let stock of stockData) {
      // Si l'entrepôt est de type "principal", on le garde
      if (stock.entrepot.type === 'principal') {
        entrepotPrincipale = stock.entrepot;
        uniteProduit = stock.unite;
        break;
      }
    }

    // Si aucun entrepôt principal n'est trouvé, on retourne 0 et un message
    if (!entrepotPrincipale) {
      return res.status(200).json({
        quantiteDisponible: 0,
        unite: "Unité",
        message: "Aucun entrepôt principal trouvé pour ce produit, mais la quantité est 0"
      });
    }

    // Récupérer la quantité disponible dans l'entrepôt principal
    const stockPrincipale = stockData.find(stock => stock.entrepot._id.toString() === entrepotPrincipale._id.toString());
    const quantiteDisponible = stockPrincipale ? stockPrincipale.quantite : 0;

    // Ajouter les informations de l'entrepôt principal et de la quantité au produit
    const produitAvecQuantite = {
      ...produit.toObject(),
      quantiteDisponible,
      entrepotId: entrepotPrincipale._id,
      entrepotNom: entrepotPrincipale.nom,
      unite: uniteProduit, // Assurez-vous que le champ 'nom' existe dans le modèle d'entrepôt
    };

    res.status(200).json(produitAvecQuantite); // Renvoyer le produit avec sa quantité et les informations de l'entrepôt
  } catch (error) {
    console.error('Erreur lors de la récupération du produit et de sa quantite:', error);
    res.status(500).json({ message: 'Erreur interne du serveur' });
  }
};





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
    const stockData = await Stock.find({ produit: id, entrepot: { $ne: entrepotPrincipale._id } })
      .populate("entrepot", "nom") // Populate pour récupérer le nom de l'entrepôt
      .populate("unite", "nom conversion");

    // Définir les valeurs par défaut
    let quantiteMaximale = 0;
    let entrepotMaxQuantite = null;
    let  entrepotIdMaxQuantite = null ;
        let uniteMaxQuantite = "Unité";

    if (stockData.length > 0) {
      // Trouver l'entrepôt avec la quantité maximale et l'unité correspondante
      stockData.forEach(stock => {
        if (stock.quantite > quantiteMaximale) {
          quantiteMaximale = stock.quantite;
          entrepotMaxQuantite = stock.entrepot.nom;
          entrepotIdMaxQuantite = stock.entrepot._id;// Récupérer le nom de l'entrepôt
          uniteMaxQuantite = stock.unite; // Récupérer le nom de l'unité
        }
      });
    }
    const entrepotSecondaireNom = entrepotMaxQuantite ? entrepotMaxQuantite.nom : " ";

    // Ajouter la quantité maximale, le nom de l'entrepôt et l'unité au produit
    const produitAvecQuantite = {
      ...produit.toObject(),
      quantiteDisponible: quantiteMaximale,
      entrepotsecondaireNom: entrepotMaxQuantite,
      entrepotId :entrepotIdMaxQuantite,
      uniteNom: uniteMaxQuantite // Ajouter l'unité à la réponse
    };

    res.json(produitAvecQuantite); // Renvoyer le produit avec les infos de stock et d'unité
  } catch (error) {
    console.error("Erreur lors de la récupération du produit et de sa quantite:", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
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
    const { quantite, prixUnitaire, statut } = req.body;

    // Validation des données d'entrée
    if (quantite <= 0 || prixUnitaire <= 0) {
      return res.status(400).json({ message: 'La quantite et le prix unitaire doivent être supérieurs à zéro.' });
    }

    // Calculer la nouvelle valeurTotale
    const valeurTotale = quantite * prixUnitaire;

    // Mise à jour du stock avec la nouvelle valeurTotale
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      { quantite, prixUnitaire, statut, valeurTotale },
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
      stockProduit.quantite += produit.quantite;
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

      if (stock.quantite < item.quantite) {
        return res.status(400).json({ message: `Pas assez de stock pour le produit ${item.produit.nom}` });
      }
    }

    // Sortie des produits et mise à jour du stock
    for (let item of commande.produits) {
      const stock = await Stock.findOne({ produit: item.produit._id, entrepot: entrepotId });

      stock.quantite -= item.quantite;

      if (stock.quantite < 0) {
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