const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  entrepot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entrepot',  
    required: true,
  },
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',  
    required: true,
  },
  quantite: {
    type: Number,
    required: true,
  },
  prixUnitaire: {
    type: Number,
    required: true,
  },
  dateEntree: {
    type: Date,
    default: Date.now,
  },
  valeurTotale: {
    type: Number,
    required: true,
  },
  unite: { type: String, required: true }, 
  statut: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif',
  },
});

// 🔹 Middleware pour recalculer `valeurTotale` avant chaque sauvegarde
stockSchema.pre('save', function (next) {
  this.valeurTotale = this.quantité * this.prixUnitaire;
  next();
});

module.exports = mongoose.model('Stock', stockSchema);
