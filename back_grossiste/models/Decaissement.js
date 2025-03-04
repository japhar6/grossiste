const mongoose = require("mongoose");

const decaissementSchema = new mongoose.Schema({
    montant: {
        type: Number,
        required: true
    },
    mode: {
        type: String,
        required: true,
        enum: ['virement bancaire', 'espèce', 'mobile money']
    },
    referencePaiement: {
        type: String,
        required: function() { return this.mode !== 'espèce'; }
    },
    periode: {
        type: String,
        required: true
    },
    dateDecaissement: {
        type: Date,
        default: Date.now
    },
    fondCaisseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoncdCaisse', // Référence au modèle FondCaisse
        required: false
    }
}, { timestamps: true });

const Decaissement = mongoose.model("Decaissement", decaissementSchema);

module.exports = Decaissement;