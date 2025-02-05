const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String },
  prix: { type: Number, required: true },
  quantite: { type: Number, required: true },
  categorie: { type: String, required: true },
  dateAjout: { type: Date, default: Date.now },
  unite: { type: String, required: true }
});

const Produit = mongoose.model('Produit', produitSchema);

module.exports = Produit;
