const express = require('express');
const router = express.Router();
const personnelController = require('../controllers/personnelController');

// Routes CRUD pour le personnel
router.post('/ajouter', personnelController.ajouterPersonnel);         // Ajouter un personnel
router.get('/afficher', personnelController.getAllPersonnels);         // Récupérer tous les personnels
router.get('/recup/:id', personnelController.getPersonnelById);      // Récupérer un personnel par ID
router.put('/modifier/:id', personnelController.updatePersonnel);       // Mettre à jour un personnel
router.delete('/supprimer/:id', personnelController.deletePersonnel);    // Supprimer un personnel

module.exports = router;
