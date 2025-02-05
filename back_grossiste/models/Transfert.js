const mongoose = require('mongoose');

const transfertSchema = new mongoose.Schema({
  entrepotSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepot',
    required: true,
  },
  entrepotDestination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepot',
    required: true,
  },
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true,
  },
  quantité: {
    type: Number,
    required: true,
  },
  dateTransfert: {
    type: Date,
    default: Date.now,
  },
  statut: {
    type: String,
    enum: ['en cours', 'terminé'],
    default: 'en cours',
  },
});

module.exports = mongoose.model('Transfert', transfertSchema);
