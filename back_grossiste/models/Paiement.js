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
    },referencePaiement:
   {
        type: String,
        required: function() { 
            return this.modePaiement === "mobile money" || this.modePaiement === "virement bancaire";
        }
    },
    statut: { 
        type: String, 
        enum: ["payé complet", "payé partielle", "annulé"], 
        default: "en cours"
    },
    totalPaiement: {
        type: Number,
        required: true
    },
    idCaissier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    modePaiement: { 
        type: String, 
        enum: ["espèce", "mobile money", "virement bancaire", "a credit"], 
        required: true 
    }
    ,
    dateLimiteCredit: { type: Date, required: false },
}, { timestamps: true });

const Paiement = mongoose.model("Paiement", paiementSchema);

module.exports = Paiement;
