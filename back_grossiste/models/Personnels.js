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
    }
}, {
    timestamps: true
});

const Personnel = mongoose.model('Personnel', personnelSchema);
module.exports = Personnel;
