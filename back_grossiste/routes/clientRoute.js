const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const upload = require('../config/multerNifStat');
// Route pour créer un client
router.post('/', upload.single("nifStatImage"), clientController.createClient);

// Route pour obtenir tous les clients
router.get('/', clientController.getAllClients);

// Route pour obtenir un client par ID
router.get('/recuperer/:id', clientController.getClientById);

// Route pour mettre à jour un client
router.put('/modifier/:id', clientController.updateClient);

// Route pour supprimer un client
router.delete('/supprimer/:id', clientController.deleteClient);

router.get("/count", clientController.countClient);

router.post('/ajouter', clientController.createClientAdmin);


module.exports = router;
