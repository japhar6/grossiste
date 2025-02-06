const mongoose = require('mongoose');
const slugify = require('slugify'); // Utilisation de slugify pour générer un slug à partir de la catégorie

const produitSchema = new mongoose.Schema({
   nom: { type: String, required: true },
  description: { type: String },
  prixdevente: { type: Number, required: false,default :'0' },
  prixDachat: { type: Number, required: false },
  categorie: { type: String, required: true },
  unite: { type: String, required: true },
  fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
  dateAjout: { type: Date, default: Date.now },
  statut: { type: String, enum: ['actif', 'inactif'], default: 'actif' },
  codeProduit: { type: String, unique: true }  
});

// Avant de sauvegarder, générer un code produit unique
produitSchema.pre('save', async function (next) {
  if (!this.codeProduit) {
    const prefix = slugify(this.categorie, { lower: true, strict: true }).substring(0, 3).toUpperCase();
    const lastProduct = await Produit.findOne({ categorie: this.categorie }).sort({ _id: -1 });

    let nextNumber = 1;
    if (lastProduct && lastProduct.codeProduit) {
      const parts = lastProduct.codeProduit.split('-');
      if (parts.length === 2 && !isNaN(parts[1])) {
        nextNumber = parseInt(parts[1], 10) + 1;
      }
    }

    const paddedNumber = String(nextNumber).padStart(3, '0');
    this.codeProduit = `${prefix}-${paddedNumber}`;
  }
  next();
});

const Produit = mongoose.model('Produit', produitSchema);

module.exports = Produit;
