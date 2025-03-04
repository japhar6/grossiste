const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
    typeClient: { type: String, required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    commercialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Commercial' },
    vendeurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    paiement: { type: mongoose.Schema.Types.ObjectId, ref: 'Paiement', default: null },
    produits: [
        {
            produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit' },
            quantite: { type: Number, required: true },
            prixdevente: { type: Number, required: true },
            total: { type: Number, required: true },
            prixApresRemise: { type: Number, required: true },
            montantApresRemise: { type: Number },
            typeRemise: { type: String },
            valeurRemise: { type: Number },
            uniteChoisie: { type: String },
            entrepotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Entrepot' },
        }
    ],
    totalGeneral: { type: Number, required: true },
    statut: { 
        type: String,  
        enum: ["en cours", "payé", "payé et livré"], 
        default: "en cours" 
    },
    typeRemise: { type: String },
    valeurRemise: { type: Number },
    referenceFacture: { type: String, unique: true },
    dateSortie: { type: Date, default: null },

    modeLivraison: { 
        type: String, 
        enum: ["magasin", "fournisseur"], 
        default: null // C'est défini au moment de la vente
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
