const mongoose = require('mongoose');

const inventaireSchema = new mongoose.Schema({
  entrepot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepot',
    required: true,
  },
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produits',
    required: true,
  },
  quantitéInitiale: {
    type: Number,
    required: true,
  },
  quantitéFinale: {
    type: Number,
    required: true,
  },
  dateInventaire: {
    type: Date,
    default: Date.now,
  },
  raisonAjustement: {
    type: String,
    enum: ['perte', 'vol', 'erreur de comptage'],
    required: true,
  },
});

module.exports = mongoose.model('Inventaire', inventaireSchema);
