const mongoose = require('mongoose');
const slugify = require('slugify'); 



const produitSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String },
  prixDachat: { type: Number, required: true }, // Prix d'achat unique
  categorie: { type: String, required: true },
  unites: [
    {
      nom: { type: String, required: true }, // Ex: Carton, Paquet, Sachet
      conversion: { type: Number, required: true }, // Ex: 1, 50, 100
      prixdevente: { type: Number, required: true } // Prix de vente unique par unité
    }
  ],
  fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: "Fournisseur", required: true },
  quantiteMinimum: { type: Number, default: 0 },
  codeProduit: { type: String, unique: false } ,

  dateAjout: { type: Date, default: Date.now }
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
