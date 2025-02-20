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
    },
    idCaissier: { // Champ pour stocker l'ID du caissier
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Modèle de tes utilisateurs (caissiers)
        required: true
    },
    referenceFacture: { // Nouveau champ pour la référence de facture
        type: String,
        required: true
    }
}, { timestamps: true });

const PaiementCommerciale = mongoose.model("PaiementCommerciale", paiementCommercialeSchema);

module.exports = PaiementCommerciale;
