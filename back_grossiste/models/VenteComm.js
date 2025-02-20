const mongoose = require("mongoose");
const Produit = mongoose.model('Produit');
const ventecomSchema = new mongoose.Schema({
    commercialId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Commercial', 
        required: true 
    },
    commandeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Commande', 
        required: true 
    },
    produitsVendus: [
        {
            produitId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Produit", 
                required: true 
            },
            quantite: { 
                type: Number, 
                required: true 
            }
        }
    ],
    dateVente: { 
        type: Date, 
        default: Date.now 
    },
    montantTotal: { 
        type: Number, 
        required: true 
    }
}, { timestamps: true });

const VenteCom = mongoose.model("VenteCom", ventecomSchema); // Changer "Vente" en "VenteCom"
module.exports = VenteCom;
