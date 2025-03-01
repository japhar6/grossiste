const mongoose = require('mongoose');

const venteSchema = new mongoose.Schema({
    commandeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Commande',
        required: true,
    },
    produits: [
        {
            produit: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Produit',
                required: true,
            },
            quantite: {
                type: Number,
                required: true,
            },
            quantiteConvertie: {
                type: Number, // Stocker la quantité convertie
                required: true,
            },
            unite: {
                type: String, // Stocker l'unité convertie
                required: true,
            }
        }
    ],
    dateVente: {
        type: Date,
        default: Date.now,
    },
    magasinierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    entrepotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrepot', // Assurez-vous que l'entité 'Entrepot' existe
        required: true
    },
    statut: {
        type: String,
        enum: ['en attente', 'validée'],
        default: 'en attente',
    },
    dateValidationMagasinier: {
        type: Date,
    }
});

module.exports = mongoose.model('Vente', venteSchema);
