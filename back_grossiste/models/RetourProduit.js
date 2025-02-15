const mongoose = require('mongoose');

const retourProduitSchema = new mongoose.Schema({
  paiementCommercialeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaimentCommerciale',  // Référence au paiement commercial en cours
    required: true,
  },
  produitsRetournes: [
    {
      produit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produit',
        required: true,
      },
      quantite: {
        type: Number,
        required: true,
      },
    }
  ],
  dateRetour: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('RetourProduit', retourProduitSchema);
