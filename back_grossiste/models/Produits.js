const mongoose = require('mongoose');
const slugify = require('slugify'); // Utilisation de slugify pour générer un slug à partir de la catégorie

const produitSchema = new mongoose.Schema({
   nom: { type: String, required: true },
  description: { type: String },
  prixdevente: { type: Number, required: false },
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
    const prefix = slugify(this.categorie, { lower: true, strict: true }).substring(0, 3).toUpperCase();  // 3 premières lettres de la catégorie
    const lastProduct = await Produit.find({ categorie: this.categorie }).sort({ _id: -1 }).limit(1);  

    let nextNumber = 1;
    if (lastProduct && lastProduct.length > 0) {
      const lastCode = lastProduct[0].codeProduit;
      const lastNumber = parseInt(lastCode.split('-')[1], 10);
      nextNumber = lastNumber + 1;
    }

    const paddedNumber = String(nextNumber).padStart(3, '0');  
    this.codeProduit = `${prefix}-${paddedNumber}`;  
  }
  next();
});

const Produit = mongoose.model('Produit', produitSchema);

module.exports = Produit;
