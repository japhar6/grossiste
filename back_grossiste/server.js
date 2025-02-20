const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const bcrypt = require('bcryptjs');
require("dotenv").config({ path: '../.env' });

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Configuration CORS
app.use(cors({
  origin: ['http://front', 'https://front'], // 🔥 Ajoute le domaine de ton Ingress
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Importation des routes
const fournisseurRoutes = require("./routes/fournisseurRoute");
const produitRoutes = require("./routes/produitRoute");
const userRoutes = require("./routes/userRoute");
const achatsRoutes = require("./routes/achatRoute");
const entrepotRoutes = require("./routes/entrepotRoute");
const clientRoutes = require('./routes/clientRoute');
const stockRoutes = require('./routes/stockRoute');
const panierRoutes = require('./routes/panierRoute');
const inventaireRoutes = require('./routes/inventaireRoute');
const transfertRoute = require('./routes/transfertRoute');
const paiementRoute = require('./routes/paiementRoute');
const paiementcomRoute = require('./routes/paimentComRoute');
const commandeRoutes = require("./routes/commandeRoute");
const comercialeRoutes = require("./routes/comercialeRoute");
const venteRoutes = require("./routes/venteRoute");

// Middleware
app.use(express.json());

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
app.use('/api/client', clientRoutes);
app.use('/api/paiementCom', paiementcomRoute);
app.use('/api/paiement', paiementRoute);
app.use("/api/commandes", commandeRoutes);
app.use("/api/comercial", comercialeRoutes);
app.use("/api/ventes", venteRoutes);

// Route de test
app.get("/", (req, res) => {
    res.send("API Grossiste en cours d'exécution...");
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
