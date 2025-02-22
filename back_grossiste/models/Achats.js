const mongoose = require('mongoose');

const achatSchema = new mongoose.Schema({
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
  fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
  quantite: { type: Number, required: true },
  quantiteTotale: { type: Number, required: true }, // Nouvelle quantité totale avec ristourne
  prixAchat: { type: Number, required: true },
  dateAchat: { type: Date, default: Date.now },
  total: { type: Number, required: true },
  panier: { type: mongoose.Schema.Types.ObjectId, ref: "Panier" },
  ristourneAppliquee: { type: Boolean, default: false } // Indiquer si la ristourne a été appliquée
});


const Achat = mongoose.model('Achat', achatSchema);
module.exports = Achat;
