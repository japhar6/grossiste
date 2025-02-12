const mongoose = require("mongoose");

const commandeSchema = new mongoose.Schema({
    clientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client',  
        required: true 
    },
    vendeurId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    modePaiement: { 
        type: String, 
        enum: ["espèce", "mobile money", "virement bancaire", "à crédit"], 
        required: true
    },
    produits: [
        {
            produit: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Produit", 
                required: true 
            },
            quantite: { 
                type: Number, 
                required: true, 
                min: 1 
            },
            prixUnitaire: { 
                type: Number, 
                required: true 
            },
            total: { 
                type: Number, 
                required: true 
            }
        }
    ],
    totalGeneral: { 
        type: Number, 
        required: true 
    },
    statut: { 
        type: String, 
<<<<<<< HEAD
        enum: ["en cours", "terminée", "annulée","livré"], 
=======
        enum: ["en cours", "terminée", "livrée", "annulée"], 
>>>>>>> a20878b9705a4f7ad6bce6ce4fc557dfe05e7388
        default: "en cours" 
    }
}, { timestamps: true });

const Commande = mongoose.model("Commande", commandeSchema);

module.exports = Commande;
