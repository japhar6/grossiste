require("dotenv").config(); // Charger les variables d'environnement
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); // Importer la fonction de connexion

const app = express();

// Middleware
app.use(express.json()); // Pour traiter les requêtes JSON
app.use(cors()); // Pour gérer les accès entre domaines

// Connexion à MongoDB via le module de connexion
connectDB();

// Route de test
app.get("/", (req, res) => {
  res.send("API Grossiste en cours d'exécution...");
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
