const mongoose = require('mongoose');

const transfertSchema = new mongoose.Schema({
  entrepotSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepot',
    required: true,
  },
  entrepotDestination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepot',
    required: true,
  },
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true,
  },
  quantitéEnvoyée: {
    type: Number,
    required: false,
  },
  quantitéReçue: {
    type: Number,
    default: 0, // Par défaut 0, sera mis à jour par l'entrepôt receveur
  },
  quantitéPerdue: {
    type: Number,
    default: 0, // Regroupe les pertes et les produits endommagés
  },
  dateTransfert: {
    type: Date,
    default: Date.now,
  },
  statutAdmin: {
    type: String,
    enum: ['en attente', 'approuvé', 'refusé'],
    default: 'en attente',
  },
  statutEntrepotDestination: {
    type: String,
    enum: ['en attente', 'reçu', 'refusé par admin'],
    default: 'en attente',
  },
});

module.exports = mongoose.model('Transfert', transfertSchema);
