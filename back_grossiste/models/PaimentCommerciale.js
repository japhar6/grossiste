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
        enum: ["non payé","payé complet","payé partiel","Produits retourner"],
        default: "non payé"
    },
    idCaissier: { // Champ pour stocker l'ID du caissier
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Modèle de tes utilisateurs (caissiers)
        required: true
    },
    referenceFacture: { // Nouveau champ pour la référence de facture
        type: String,
        required: true
    },
    referencePaiement: {
        type: String,
        required: function() { 
            return this.modePaiement === "mobile money" || this.modePaiement === "virement bancaire";
        }
    },
    modePaiement: { 
        type: String, 
        enum: ["espèce", "mobile money", "virement bancaire", "a credit"], 
        required: true 
    },  dateLimiteCredit: { type: Date, required: false },
}, { timestamps: true });

const PaiementCommerciale = mongoose.model("PaiementCommerciale", paiementCommercialeSchema);

module.exports = PaiementCommerciale;
