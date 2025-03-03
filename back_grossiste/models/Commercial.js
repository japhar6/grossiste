const mongoose = require("mongoose");

const commercialSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false
    },
    telephone: {
        type: String,
        required: false
    },
    statut: {
        type: String,
        default: 'actif', 
    },
    dateInscription: {
        type: Date,
        default: Date.now,
    },
    type : {
        type: String, required : false 
    }
}, { timestamps: true });

const Commercial = mongoose.model("Commercial", commercialSchema);

module.exports = Commercial;
