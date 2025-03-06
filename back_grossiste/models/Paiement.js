const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema({
    commandeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Commande",
        required: true
    },
    montantPaye: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                if (this.modePaiement === "a credit") {
                    return value === 0;
                }
                return true;
            },
            message: "Le montant payé doit être 0 pour un paiement à crédit."
        }
    },
    referencePaiement: {
        type: String,
        required: function() { 
            return ["mobile money", "virement bancaire", "cheque"].includes(this.modePaiement);
        }
    },
    datePositionnementCheque: { 
        type: Date, 
        required: function() { return this.modePaiement === "cheque"; } 
    },
    statut: { 
        type: String, 
        enum: ["payé complet", "payé partielle", "annulé", "non payé"], 
        default: "non payé"
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
        enum: ["espèce", "mobile money", "virement bancaire", "cheque", "a credit","versement"], 
        required: true 
    },
    referenceFacture: { 
        type: String,
        required: true
    },
    dateLimiteCredit: { 
        type: Date, 
        required: function() { return this.modePaiement === "a credit"; } 
    },
    datePaiement: { 
        type: Date,
        default: function() { return this.modePaiement === "a credit" ? null : Date.now(); }
    }
}, { timestamps: true });

const Paiement = mongoose.model("Paiement", paiementSchema);

module.exports = Paiement;
