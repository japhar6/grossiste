const mongoose = require('mongoose');

const personnelSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    },
    poste: {
        type: String,
        required: true,
        trim: true
    },
    telephone: {
        type: String,
        required: true,
        trim: true
    },
    dateEmbauche: {
        type: Date,
        default: Date.now
    },
    statut: {
        type: String,
        enum: ['Actif', 'Inactif'],
        default: 'Actif'
    },
    adresse: {
        type: String,
        trim: true
    },
    salaireBrut: {
        type: Number,
        required: true,
        min: 0
    },
    modePaiement: {
        type: String,
        enum: ['journalier', 'hebdomadaire', 'mensuel'],
        required: true
    },
    historiquePaiements: [{
        periode: String, 
        montant: Number,
        datePaiement: Date,
        statutPaiement: { 
            type: String, 
            enum: ['Payé', 'En attente'], 
            default: 'Payé' 
        }
    }]
}, {
    timestamps: true
});

const Personnel = mongoose.model('Personnel', personnelSchema);
module.exports = Personnel;
