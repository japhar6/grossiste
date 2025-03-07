const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/CommandeController');
const Commande = require("../models/Commandes");
const mongoose = require('mongoose');

// Lors de la recherche du produit dans la commande


// Route pour ajouter une commande
router.post('/ajouter', commandeController.ajouterCommande);

// Route pour récupérer toutes les commandes (ou filtrées par client, par vendeur, etc.)
router.get('/', commandeController.getCommandes);

// Route pour récupérer une commande par son ID
router.get('/recuperer/:id', commandeController.getCommandeById);

router.post("/annuler-commande/:referenceFacture", commandeController.annulerVenteParReference);
// Route pour mettre à jour une commande
router.put('/:id', commandeController.updateCommande);

// Route pour supprimer une commande
router.delete('/:id', commandeController.deleteCommande);

router.get("/count", commandeController.countCommande);
// Route pour récupérer une commande par référence de facture
router.get('/reference/:referenceFacture', commandeController.getCommandeByref);

// Route pour récupérer les commandes avec les statuts "terminée" et "livrée"
router.get('/TermineeLivree', commandeController.getCommandesTermineesEtLivrees);
// Route pour récupérer les commandes avec les statuts "terminée" et "livrée"
router.get('/TermineeLivreeMaga', commandeController.getCommandesLivrees);
router.get('/vendeur/:vendeurId', commandeController.getCommandesByVendeur);

router.get('/suggestions', commandeController.getSuggestions);
router.get('/factmo', commandeController.getSuggestionscom);
router.get('/factmocli', commandeController.getSuggestionscomcre);
router.put('/sortieFournisseur/:commandeId', commandeController.sortieFournisseur);
router.get('/commandeDecomposees', commandeController.getCommandesDecomposees);
router.get('/toutfact', commandeController.getSuggestionstous);

router.put('/update-prix/:referenceFacture', async (req, res) => {
  console.log("📥 Données reçues:", req.body);
  
  const { referenceFacture } = req.params;
  let { produitsToUpdate, typeRemise, valeurRemise } = req.body;

  // Vérification de la structure des données
  if (!Array.isArray(produitsToUpdate) || produitsToUpdate.length === 0) {
    console.log("⚠️ produitsToUpdate est vide ou mal formé:", produitsToUpdate);
    return res.status(400).json({ msg: 'Les produits à mettre à jour sont invalides ou manquants.' });
  }

  try {
    console.log(`🔎 Recherche de la commande avec référence : ${referenceFacture}`);
    const commande = await Commande.findOne({ referenceFacture });

    if (!commande) {
      console.log(`❌ Commande non trouvée pour la référence ${referenceFacture}`);
      return res.status(404).json({ msg: 'Commande non trouvée' });
    }

    console.log(`✅ Commande trouvée : ${commande.referenceFacture}`);

    // Mise à jour des prix des produits
    for (let i = 0; i < produitsToUpdate.length; i++) {
      const updatedProduct = produitsToUpdate[i];
      const produitIndex = commande.produits.findIndex(
        (product) => 
          new mongoose.Types.ObjectId(product.produit).toString() === String(updatedProduct.produitId) && 
          product.uniteChoisie === updatedProduct.uniteChoisie
      );

      if (produitIndex !== -1) {
        console.log(`🛠 Mise à jour du produit ${commande.produits[produitIndex].produit.nom}`);
        commande.produits[produitIndex].prixdevente = updatedProduct.prixdevente;
        commande.produits[produitIndex].total = updatedProduct.prixdevente * commande.produits[produitIndex].quantite;
      } else {
        console.log(`⚠️ Produit avec ID ${updatedProduct.produitId} et unité ${updatedProduct.uniteChoisie} non trouvé dans la commande.`);
      }
    }

    // Application de la remise générale
    if (typeRemise === 'parProduit') {
      commande.typeRemise = 'parProduit';
    } else {
      commande.typeRemise = typeRemise; // Autres types de remise
    }

    commande.valeurRemise = valeurRemise; // Appliquez la remise si nécessaire
    commande.totalGeneral = commande.produits.reduce((sum, produit) => sum + produit.total, 0);

  
    // Calcul du total général après application de la remise
    commande.totalGeneral = commande.produits.reduce((acc, product) => acc + product.total, 0);
    if (typeRemise === 'montantFixe') {
      commande.totalGeneral -= valeurRemise;
      console.log(`💰 Remise fixe appliquée sur le total général: ${valeurRemise}`);
    } else if (typeRemise === 'pourcentage') {
      commande.totalGeneral *= (1 - valeurRemise / 100);
      console.log(`💰 Remise en pourcentage appliquée: ${valeurRemise}%`);
    }

    // Mise à jour du statut de la commande
    commande.statut = "en cours";

    // Sauvegarde de la commande mise à jour
    await commande.save();
    console.log(`✅ Commande ${commande.referenceFacture} mise à jour avec succès.`);

    // Réponse au client
    res.json({ msg: 'Prix des produits mis à jour et remise appliquée', commande });

  } catch (err) {
    console.error(`❌ Erreur serveur: ${err.message}`);
    res.status(500).send('Erreur du serveur');
  }
});


module.exports = router;
