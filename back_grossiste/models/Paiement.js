const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema({
    commandeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commande",
        required: true
    },
    montantPaye: {
        type: Number,
        required: true
    },
    statut: { 
        type: String, 
        enum: ["partiel", "complet", "annulé"], 
        default: "partiel"
    },
    remiseGlobale: { 
        type: Number, 
        default: 0 
    },
    remiseFixe: {  // Ajout de la remise fixe
        type: Number,
        default: 0
    },
    remiseParProduit: [
        {
            produitId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Produit",
                required: true
            },
            remise: {
                type: Number,
                default: 0
            }
        }
    ],
    totalPaiement: {
        type: Number,
        required: true
    },
    idCaissier: { // Nouveau champ pour stocker l'ID du caissier
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Assure-toi que "User" est le modèle de tes utilisateurs (caissiers)
        required: true
    }
}, { timestamps: true });

const Paiement = mongoose.model("Paiement", paiementSchema);

module.exports = Paiement;
