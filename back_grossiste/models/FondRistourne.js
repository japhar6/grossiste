const mongoose = require('mongoose');

const fondRistourneSchema = new mongoose.Schema({
  fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
  panier: { type: mongoose.Schema.Types.ObjectId, ref: 'Panier', required: true },
  montantRistourne: { type: Number, required: true },
  dateAchat: { type: Date, default: Date.now },
  statut: { 
    type: String, 
    enum: ['En attente', 'Prélevé'], 
    default: 'En attente' 
  }
});


const FondRistourne = mongoose.model('FondRistourne', fondRistourneSchema);
module.exports = FondRistourne;