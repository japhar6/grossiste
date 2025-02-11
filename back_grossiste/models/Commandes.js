const mongoose = require("mongoose");

const commandeSchema = new mongoose.Schema({
    client: {
        nom: { type: String, required: true },
        numero: { type: String, required: true },
        adresse: { type: String, required: true }
    },
    modePaiement: { 
        type: String, 
        required: true, 
        enum: ["espèce", "mobile money", "virement bancaire", "à crédit"] 
    },
    statut: { 
        type: String, 
        enum: ["en cours", "payée", "annulée"], 
        default: "en cours" 
    },
    produits: [
        {
            produit: { type: mongoose.Schema.Types.ObjectId, ref: "Produit", required: true },
            nomProduit: { type: String, required: true },
            quantite: { type: Number, required: true, min: 1 },
            prixUnitaire: { type: Number, required: true },
            total: { type: Number, required: true },
            remise: { 
                type: Number, // Remise en pourcentage sur le produit
                default: 0 
            }
        }
    ],
    remiseGlobale: { 
        type: Number, // Remise globale sur la commande en pourcentage
        default: 0
    },
    totalGeneral: { 
        type: Number, 
        required: true 
    },
}, { timestamps: true });

const Commande = mongoose.model("Commande", commandeSchema);

module.exports = Commande;
