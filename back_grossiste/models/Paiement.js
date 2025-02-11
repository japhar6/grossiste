const mongoose = require('mongoose');

const paiementSchema = new mongoose.Schema({
  commandeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',  // Référence à la commande
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',    // Référence au client
    required: true,
  },
  montantTotal: {
    type: Number,
    required: true,
  },
  montantPaye: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return v <= this.montantTotal; // Validation pour s'assurer que le montant payé ne dépasse pas le montant total
      },
      message: props => `Le montant payé ne peut pas dépasser le montant total (${props.value} > ${this.montantTotal})`
    },
  },
  statut: {
    type: String,
    enum: ['en cours', 'complet', 'partiel'],  
    default: 'en cours',
  },
  datePaiement: {
    type: Date,
    default: Date.now,  
  },
  caissierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',   // Référence au caissier
    required: true,
  },
});

// Méthode virtuelle pour calculer le reste à payer
paiementSchema.virtual('resteAPayer').get(function() {
  return this.montantTotal - this.montantPaye;
});

module.exports = mongoose.model('Paiement', paiementSchema);
