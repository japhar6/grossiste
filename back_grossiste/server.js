const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require("dotenv").config();


const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Importation des routes
const fournisseurRoutes = require("./routes/fournisseurRoute"); 

const produitRoutes = require("./routes/produitRoute");

const userRoutes = require("./routes/userRoute");

const achatsRoutes = require("./routes/achatRoute");


const entrepotRoutes = require("./routes/entrepotRoute");

const stockRoutes = require('./routes/stockRoute');

const panierRoutes = require('./routes/panierRoute');

const inventaireRoutes = require('./routes/inventaireRoute');

const transfertRoute = require('./routes/transfertRoute');

const commandeRoutes = require("./routes/commandeRoute");

// Middleware
app.use(express.json());
app.use(cors());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));


// Middleware pour les routes des fournisseurs
app.use("/api/fournisseurs", fournisseurRoutes);
app.use("/api/produits", produitRoutes);
app.use("/api/users", userRoutes);
app.use("/api/achats", achatsRoutes);
app.use("/api/entrepot", entrepotRoutes);
app.use('/api/stocks', stockRoutes); 
app.use('/api/paniers', panierRoutes); 
app.use('/api/inventaire', inventaireRoutes);
app.use('/api/transfert', transfertRoute);
app.use("/api/commandes", commandeRoutes);

// Route de test
app.get("/", (req, res) => {
  res.send("API Grossiste en cours d'exécution...");
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
