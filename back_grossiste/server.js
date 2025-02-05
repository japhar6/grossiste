const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require("dotenv").config();


const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Importation des routes
const fournisseurRoutes = require("./routes/fournisseurRoute"); 
const userRoutes = require("./routes/userRoute");



// Middleware
app.use(express.json());
app.use(cors());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connecté à MongoDB"))
.catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// Middleware pour les routes des fournisseurs
app.use("/api/fournisseurs", fournisseurRoutes);
app.use("/api/users", userRoutes);
// Route de test
app.get("/", (req, res) => {
  res.send("API Grossiste en cours d'exécution...");
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
