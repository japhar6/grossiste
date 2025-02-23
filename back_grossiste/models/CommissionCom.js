const mongoose = require('mongoose');

const commissioncomSchema = new mongoose.Schema({
  commercialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commercial',
    required: true
  },
  montant: {
    type: Number,
    required: true
  },
  pourcentage: {
    type: Number,
    required: false // Ajoutez cette ligne si le pourcentage est optionnel
  },
  typeCommission: {
    type: String,
    enum: ['pourcentage', 'montantFixe'],
    required: true
  },
  periode: {
    type: String,
    enum: ['mensuel', 'hebdomadaire'],
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['payée', 'en_attente'],
    default: 'en_attente'
  }
});

const CommissionCom = mongoose.model('CommissionCom', commissioncomSchema);

module.exports = CommissionCom;
