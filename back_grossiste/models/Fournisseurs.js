import mongoose from 'mongoose';

const fournisseurSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  type: { type: String, enum: ['prix_fixe', 'ristourne', 'prix_imposé'], required: true },
  contact: {
    telephone: { type: String, required: true },
    email: { type: String },
    adresse: { type: String }
  },
  conditions: {
    ristourne: { type: Number, default: 0 }, // Ex: 2% de ristourne
    prix_imposé: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

const Fournisseur = mongoose.model('Fournisseur', fournisseurSchema);

export default Fournisseur;
