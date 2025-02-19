const mongoose = require("mongoose");

const commandeSchema = new mongoose.Schema({
    clientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Client' 
    },
    commercialId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Commercial' 
    },
    vendeurId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    typeClient: { 
        type: String, 
        enum: ["Client", "Commercial"], 
        required: true 
    },
    referenceFacture: {
        type: String,
        unique: true
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
        enum: ["en attente", "en cours", "terminée", "livrée", "annulée"], 
        default: "en attente" 
    }
}, { timestamps: true });

// Hook pour générer la référence de facture
commandeSchema.pre('save', async function(next) {
    if (!this.referenceFacture) {
        try {
            const prefix = this.typeClient === "Client" ? "FACTCLI" : "FACTCOM";
            const lastCommande = await mongoose.model("Commande").findOne({ referenceFacture: new RegExp(`^${prefix}-`) })
                .sort({ createdAt: -1 });

            let numero = 1;
            if (lastCommande && lastCommande.referenceFacture) {
                const lastNumber = parseInt(lastCommande.referenceFacture.split('-')[1]);
                numero = lastNumber + 1;
            }

            this.referenceFacture = `${prefix}-${String(numero).padStart(3, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const Commande = mongoose.model("Commande", commandeSchema);
module.exports = Commande;
