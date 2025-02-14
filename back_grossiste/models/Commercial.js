const mongoose = require("mongoose");

const commercialSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    telephone: {
        type: Number,
        required: true
    },
    statut: {
        type: String,
        default: 'actif', 
    },
    dateInscription: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Commercial = mongoose.model("Commercial", commercialSchema);

module.exports = Commercial;
