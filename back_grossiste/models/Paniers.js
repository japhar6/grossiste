const mongoose = require("mongoose");

const panierSchema = new mongoose.Schema({
    achats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Achat" }],
    totalGeneral: { type: Number, required: true },
    dateAchat: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Panier", panierSchema);
