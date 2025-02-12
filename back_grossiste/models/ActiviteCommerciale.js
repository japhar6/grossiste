const mongoose = require("mongoose");

const activiteCommercialeSchema = new mongoose.Schema({
    commercialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commercial",
        required: true
    },
    // Liste des produits pris par le commercial
    produitsPris: [
        {
            produitId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Produit",
                required: true
            },
            quantite: {
                type: Number,
                required: true
            },
            prixUnitaire: {
                type: Number,
                required: true
            },
            datePrise: {
                type: Date,
                default: Date.now
            }
        }
    ],
    // Liste des produits retournés par le commercial
    produitsRetournes: [
        {
            produitId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Produit",
                required: true
            },
            quantite: {
                type: Number,
                required: true
            },
            prixUnitaire: {
                type: Number,
                required: true
            },
            dateRetour: {
                type: Date,
                default: Date.now
            }
        }
    ],
    // Montant total dû par le commercial (dette)
    dette: {
        type: Number,
        default: 0
    },
    // Paiements effectués par le commercial pour régler sa dette
    paiements: [
        {
            montant: {
                type: Number,
                required: true
            },
            datePaiement: {
                type: Date,
                default: Date.now
            },
            statut: {
                type: String,
                enum: ["partiel", "complet"],
                default: "partiel"
            }
        }
    ]
}, { timestamps: true });

const ActiviteCommerciale = mongoose.model("ActiviteCommerciale", activiteCommercialeSchema);

module.exports = ActiviteCommerciale;
