const express = require('express');
const router = express.Router();
const personnelController = require('../controllers/personnelController');

// Routes CRUD pour le personnel
router.post('/ajouter', personnelController.ajouterPersonnel);         // Ajouter un personnel
router.get('/afficher', personnelController.getAllPersonnels);         // Récupérer tous les personnels
router.get('/recup/:id', personnelController.getPersonnelById);      // Récupérer un personnel par ID
router.put('/modifier/:id', personnelController.updatePersonnel);       // Mettre à jour un personnel
router.delete('/supprimer/:id', personnelController.deletePersonnel); 
router.get('/:id/historique-paiements', personnelController.getHistoriquePaiements); // Voir l'historique des paiements d'un employé   // Supprimer un personnel
router.get('/recuppay/:id', personnelController.getHistoriquePaiements);  
// 🔹 Routes pour la gestion des paiements
router.post('/faire/:id/paiements', personnelController.enregistrerPaiement);  // Enregistrer un paiement de salaire
router.get('/totals/:periode', personnelController.getTotalSalaireParPeriode);  // Enregistrer un paiement de salaire



module.exports = router;
