const mongoose = require('mongoose');

const achatSchema = new mongoose.Schema({
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
  fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
  quantite: { type: Number, required: true },
  prixAchat: { type: Number, required: true },
  dateAchat: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  panier: { type: mongoose.Schema.Types.ObjectId, ref: "Panier" } 
});

const Achat = mongoose.model('Achat', achatSchema);
module.exports = Achat;
