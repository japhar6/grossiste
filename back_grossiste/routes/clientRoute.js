const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const clientController = require('../controllers/clientController');
const upload = require('../config/multerNifStat');
const mongoose = require('mongoose');
const pusher = require('../config/pusher');  
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

router.post('/modifier-credit', async (req, res) => {
    const { clientId, creditDate } = req.body;
  
    // Vérifier si l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: 'L\'ID du client est invalide' });
    }
  
    try {
      // Trouver le client par son ID
      const client = await Client.findById(clientId);
  
      // Vérifier si le client existe
      if (!client) {
        return res.status(404).json({ message: 'Client non trouvé' });
      }
  
      // Mettre à jour 'creerPar' en 'admin' et ajouter la date limite du crédit
      client.creerPar = 'admin';
   // Ajouter la date limite du crédit
      await client.save(); // Sauvegarder les modifications
  
      // Envoie la notification au caissier avec la date limite
      pusher.trigger("caissier-channel", "credit-request", {
        message: `Le client ${client.nom} peut maintenant avoir un crédit jusqu'au ${creditDate}.`
      });
  
      res.status(200).json({ message: 'Le statut du client a été mis à jour et la notification envoyée.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du client' });
    }
  });
  

module.exports = router;
