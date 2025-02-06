const express = require("express");
const router = express.Router();
const entrepotController = require("../controllers/entrepotController");
const authenticateJWT = require("../config/middleware/authenticateJWT");
const authenticateAdmin = require("../config/middleware/authenticateAdmin");
const authenticateMagasinier = require("../config/middleware/authenticateMagasinier");

// 🔹 Ajouter un nouvel entrepôt (admin uniquement)
router.post("/", authenticateJWT, authenticateAdmin, entrepotController.createEntrepot);

// 🔹 Récupérer tous les entrepôts (admin + magasinier)
router.get("/", authenticateJWT, authenticateMagasinier, entrepotController.getAllEntrepots);

// 🔹 Récupérer un entrepôt par ID (admin + magasinier)
router.get("/:id", authenticateJWT, authenticateMagasinier, entrepotController.getEntrepotById);

// 🔹 Mettre à jour un entrepôt (admin + magasinier)
router.put("/:id", authenticateJWT, authenticateMagasinier, entrepotController.updateEntrepot);

// 🔹 Supprimer un entrepôt (admin uniquement)
router.delete("/:id", authenticateJWT, authenticateAdmin, entrepotController.deleteEntrepot);

module.exports = router;
