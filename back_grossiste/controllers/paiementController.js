const Paiement = require('../models/Paiement'); 
const Client = require('../models/Client');
const User = require('../models/User');

// Créer un paiement
exports.createPaiement = async (req, res) => {
  try {
    const { commandeId, clientId, montantTotal, montantPaye, statut, caissierId } = req.body;

    // Vérifier si le client existe
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client non trouvé' });
    }

    // Créer un paiement
    const newPaiement = new Paiement({
      commandeId,
      clientId,
      montantTotal,
      montantPaye,
      statut: montantPaye === montantTotal ? 'complet' : statut || 'en cours',
      caissierId,
    });

    await newPaiement.save();
    res.status(201).json({ message: 'Paiement effectué avec succès', paiement: newPaiement });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'encaissement du paiement', error });
  }
};

// Récupérer tous les paiements
exports.getAllPaiements = async (req, res) => {
  try {
    const paiements = await Paiement.find().populate('clientId', 'nom').populate('caissierId','nom'); 
    res.status(200).json(paiements);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des paiements', error });
  }
};

// Récupérer un paiement par ID
exports.getPaiementById = async (req, res) => {
  try {
    const paiement = await Paiement.findById(req.params.id).populate('clientId', 'nom'); 
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.status(200).json(paiement);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du paiement', error });
  }
};

// Mettre à jour un paiement
exports.updatePaiement = async (req, res) => {
  try {
    const updatedPaiement = await Paiement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPaiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.status(200).json({ message: 'Paiement mis à jour avec succès', paiement: updatedPaiement });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du paiement', error });
  }
};

// Supprimer un paiement
exports.deletePaiement = async (req, res) => {
  try {
    const paiement = await Paiement.findByIdAndDelete(req.params.id);
    if (!paiement) {
      return res.status(404).json({ message: 'Paiement non trouvé' });
    }
    res.status(200).json({ message: 'Paiement supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du paiement', error });
  }
};
