const express = require("express");
const router = express.Router();
const entrepotController = require("../controllers/entrepotController");
const authenticateJWT = require("../config/middleware/authenticateJWT");
const authenticateAdmin = require("../config/middleware/authenticateAdmin");

// 🔹 Ajouter un nouvel entrepôt (accessible uniquement à l'admin)
router.post("/", authenticateJWT, authenticateAdmin, entrepotController.createEntrepot);

// 🔹 Récupérer tous les entrepôts
router.get("/", authenticateJWT, entrepotController.getAllEntrepots);

// 🔹 Récupérer un entrepôt par ID
router.get("/:id", authenticateJWT, entrepotController.getEntrepotById);

// 🔹 Mettre à jour un entrepôt 
router.put("/:id", authenticateJWT, authenticateAdmin, entrepotController.updateEntrepot);

// 🔹 Supprimer un entrepôt (admin uniquement)
router.delete("/:id", authenticateJWT, authenticateAdmin, entrepotController.deleteEntrepot);

module.exports = router;
