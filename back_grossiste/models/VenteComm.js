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
            },
            unite: { 
                type: String,  // Ajout de l'unité du produit
                required: true 
            }
        }
    ],
    produitsRestants: [
        {
            produitId: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: "Produit", 
                required: true 
            },
            quantiteRestante: { 
                type: Number, 
                required: true 
            },
            unite: { 
                type: String,  // Ajout de l'unité aussi dans les produits restants
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

const VenteCom = mongoose.model("VenteCom", ventecomSchema);
module.exports = VenteCom;
