const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  type: { type: String, enum: ['prix_libre', 'ristourne'], required: true },
  contact: {
    telephone: { type: String, required: true },
    email: { type: String },
    adresse: { type: String, required: true }
  },
  conditions: {
    ristourne: { type: Number, default: 0 }, // Ristourne générale
    typeRistourne: { type: String, enum: ['générale', 'par_produit'], required: true } // Type de ristourne
  },
  logo: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

const Fournisseur = mongoose.model('Fournisseur', fournisseurSchema);
module.exports = Fournisseur;
