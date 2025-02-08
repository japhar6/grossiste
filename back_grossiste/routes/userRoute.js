const express = require("express");
const userController = require("../controllers/UserController");
const upload = require("../config/multerUser");
const authenticateJWT = require("../config/middleware/authenticateJWT");
const authenticateAdmin = require("../config/middleware/authenticateAdmin");

const router = express.Router();

// 📌 Enregistrement d'un utilisateur (Admin & Personnel) - Accès réservé à l'admin
router.post("/register", authenticateJWT, authenticateAdmin, upload.single("photo"), userController.register);

// 📌 Création d'un admin - Accessible à tous (1er admin)
router.post("/create-admin", upload.single("photo"), userController.createAdmin);

// 📌 Connexion - Accessible par tous les utilisateurs
router.post("/login", userController.login);

// 📌 Obtenir tous les utilisateurs - Admin uniquement
router.get("/tout", authenticateJWT, authenticateAdmin, userController.getAllUsers);


// 📌 Obtenir un utilisateur spécifique - Accessible par l'utilisateur lui-même ou un admin
router.get("/tout/:id", authenticateJWT, userController.getUserById);

// Route pour obtenir un utilisateur spécifique - accessible par admin uniquement
router.get("/seul/:id", authenticateJWT, userController.getUserById);


// 📌 Mise à jour du profil utilisateur - L'utilisateur peut mettre à jour son propre profil
router.put("/:id", authenticateJWT, upload.single("photo"), userController.updateUser);

// 📌 Suppression d'un utilisateur - Admin uniquement
router.delete("/:id", authenticateJWT, authenticateAdmin, userController.deleteUser);

module.exports = router;
