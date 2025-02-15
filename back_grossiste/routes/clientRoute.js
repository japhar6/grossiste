const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

// Route pour créer un client
router.post('/', clientController.createClient);

// Route pour obtenir tous les clients
router.get('/', clientController.getAllClients);

// Route pour obtenir un client par ID
router.get('/:id', clientController.getClientById);

// Route pour mettre à jour un client
router.put('/:id', clientController.updateClient);

// Route pour supprimer un client
router.delete('/:id', clientController.deleteClient);

module.exports = router;
