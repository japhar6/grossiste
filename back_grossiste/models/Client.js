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
  creerPar: { 
    type: String, 
    enum: ["admin", "vendeur"], 
    default: "vendeur"  
  }
  ,
  statut: {
    type: String,
    enum: ['actif', 'inactif'],
    default: 'actif',
  }, nif: { type: String, default: null },
  stat: { type: String, default: null },
  nifStatImage: { type: String, default: null }  ,
  

  
});

module.exports = mongoose.model('Client', clientSchema);
