const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "vendeur", "magasinier", "caissier", "gestion_prix"],
    required: true
  },
  photo: { type: String },
  status: {
    type: String,
    enum: ["actif", "licencié"],
    default: "actif" 
  },
  numero_cin: { type: String, required: true, unique: true }, 
  createdAt: { type: Date, default: Date.now }
});

// Hachage du mot de passe avant l'enregistrement
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
