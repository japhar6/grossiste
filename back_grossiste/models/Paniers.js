const mongoose = require("mongoose");

const panierSchema = new mongoose.Schema({
    achats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Achat" }],
    totalGeneral: { type: Number, required: true },
    dateAchat: { type: Date, default: Date.now },
    modePaiement: { type: String, enum: ["espèce", "crédit", "virement bancaire", "mobile money"], default: null }, // Mode de paiement
    dateLimiteCredit: { type: Date, default: null }, // Date limite de crédit
    referencePaiement: { type: String, default: null }, // Référence de paiement
    statut: { type: String, enum: ["non payé", "payé"], default: "non payé" } // Statut de paiement
});

module.exports = mongoose.model("Panier", panierSchema);
