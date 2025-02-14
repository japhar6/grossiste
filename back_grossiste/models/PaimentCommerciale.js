const mongoose = require("mongoose");

const paiementCommercialeSchema = new mongoose.Schema({
    commandeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commande",
        required: true
    },
    montantPaye: {
        type: Number,
        default: 0
    },
    montantRestant: {
        type: Number,
        required: true
    },
    totalPaiement: {
        type: Number,
        required: true
    },
    statut: {
        type: String,
        enum: ["partiel", "complet"],
        default: "partiel"
    }
}, { timestamps: true });

const PaiementCommerciale = mongoose.model("PaiementCommerciale", paiementCommercialeSchema);

module.exports = PaiementCommerciale;
