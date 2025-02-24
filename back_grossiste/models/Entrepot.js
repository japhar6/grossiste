const mongoose = require('mongoose');

const entrepotSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    unique: true,
  },
  localisation: {
    type: String,
    required: true,
  },
  magasinier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Assure-toi que le modèle correspondant est bien 'User'
    required: true,
  },
  type: {
    type: String,
    enum: ['principal', 'secondaire'],
    required: true,
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  }
});

// Vérification correcte si le modèle existe déjà
module.exports = mongoose.models['Entrepot'] || mongoose.model('Entrepot', entrepotSchema);
