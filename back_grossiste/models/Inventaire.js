const mongoose = require('mongoose');

const inventaireSchema = new mongoose.Schema({
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
  quantitéInitiale: {
    type: Number,
    required: true,
  },
  quantitéFinale: {
    type: Number,
    required: true,
  },
  dateInventaire: {
    type: Date,
    default: Date.now,
  },
  raisonAjustement: {
    type: String,
   
    required: true,
  },
  personneId: { // Ajoutez cet attribut
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assurez-vous de référencer le bon modèle
    required: true,
  },
});

module.exports = mongoose.model('Inventaire', inventaireSchema);
