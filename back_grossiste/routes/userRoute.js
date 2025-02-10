const express = require("express");
const userController = require("../controllers/userController");
const upload = require("../config/multerUser");
const authenticateJWT = require("../config/middleware/authenticateJWT");
const authenticateAdmin = require("../config/middleware/authenticateAdmin");

const router = express.Router();

// Route pour enregistrer un utilisateur - accessible par admin uniquement
router.post("/register", authenticateJWT, authenticateAdmin, upload.single("photo"), userController.register);

// Route pour la connexion de l'utilisateur - accessible par tous
router.post("/login", userController.login);

// Route pour obtenir tous les utilisateurs - accessible par admin uniquement
router.get("/tout", authenticateJWT, authenticateAdmin, userController.getAllUsers);

// Route pour obtenir un utilisateur spécifique - accessible par admin uniquement
router.get("/tout/:id", authenticateJWT, userController.getUserById);

// Route pour mettre à jour un utilisateur - accessible par admin uniquement
router.put("/:id", authenticateJWT, upload.single("photo"), userController.updateUser);

// Route pour supprimer un utilisateur - accessible par admin uniquement
router.delete("/:id", authenticateJWT, authenticateAdmin, userController.deleteUser);

module.exports = router;
