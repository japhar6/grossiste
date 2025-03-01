const express = require('express');
const router = express.Router();
const VenteController = require('../controllers/venteController');
const Vente = require('../models/Ventes');
router.post('/valider', VenteController.validerVente);
router.post("/retour", VenteController.validerRetourProduits);
router.get('/ventesall', VenteController.getAllVentes);
router.get('/ventes/:commandeId', async (req, res) => {
    try {
      const { commandeId } = req.params;
  
      // Rechercher les ventes liées à la commandeId
      const ventes = await Vente.find({ commandeId })
      
        
        .populate('magasinierId', 'nom email') // Remplir les détails du magasinier
        .populate('entrepotId', 'nom localisation'); // Remplir les détails de l'entrepôt
  
      // Si aucune vente n'est trouvée
      if (!ventes || ventes.length === 0) {
        return res.status(404).json({ message: 'Aucune vente trouvée pour cette commande.' });
      }
  
      // Retourner les ventes trouvées
      res.status(200).json(ventes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
  });

module.exports = router;
