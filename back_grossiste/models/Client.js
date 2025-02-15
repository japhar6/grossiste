const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
 
  telephone: {
    type: String,
    required: false,
  },
  adresse: {
    type: String,
    required: false,
  },
  dateInscription: {
    type: Date,
    default: Date.now,  
  },
  statut: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif',
  },
});

module.exports = mongoose.model('Client', clientSchema);
