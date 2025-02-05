const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
   nom: { type: String, required: true },
  description: { type: String },
  prix: { type: Number, required: true },

  categorie: { type: String, required: true },
  unite: { type: String, required: true },
  fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true }, // Correction de la référence
  dateAjout: { type: Date, default: Date.now },
  statut: { type: String, enum: ['actif', 'inactif'], default: 'actif' }, // Ajout du statut du produit

});

// Avant de sauvegarder, générer un code produit unique
produitSchema.pre('save', function (next) {
  if (!this.codeProduit) {
    this.codeProduit = `PRD-${Date.now()}`;
  }
  next();
});

const Produit = mongoose.model('Produit', produitSchema);

module.exports = Produit;
