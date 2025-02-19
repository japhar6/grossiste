const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/CommandeController');

// Route pour ajouter une commande
router.post('/ajouter', commandeController.ajouterCommande);

// Route pour récupérer toutes les commandes (ou filtrées par client, par vendeur, etc.)
router.get('/', commandeController.getCommandes);

// Route pour récupérer une commande par son ID
router.get('/:id', commandeController.getCommandeById);

// Route pour mettre à jour une commande
router.put('/:id', commandeController.updateCommande);

// Route pour supprimer une commande
router.delete('/:id', commandeController.deleteCommande);

// Route pour récupérer une commande par référence de facture
router.get('/reference/:referenceFacture', commandeController.getCommandeById);

// Route pour récupérer les commandes avec les statuts "terminée" et "livrée"
router.get('/TermineeLivree', commandeController.getCommandesTermineesEtLivrees);


module.exports = router;
