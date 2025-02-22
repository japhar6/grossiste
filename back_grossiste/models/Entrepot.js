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
    ref: 'User',  // Référence à la collection 'user'
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

module.exports = mongoose.models.Entrepot || mongoose.model('Entrepot', entrepotSchema);
