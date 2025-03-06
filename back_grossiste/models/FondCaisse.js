const mongoose = require("mongoose");

const foncdCaisseSchema = new mongoose.Schema({
    totalPaiement: {
        type: Number,
        required: true
    },
    datePaiement: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const FoncdCaisse = mongoose.model("FoncdCaisse", foncdCaisseSchema);

module.exports = FoncdCaisse;
