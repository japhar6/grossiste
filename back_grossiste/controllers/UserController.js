const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
      const { nom, email, password, role } = req.body;
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "❌ Cet email est déjà utilisé" });
      }
  
      const photo = req.file ? `/uploads/users/${req.file.filename}` : null;
  
      const newUser = new User({ nom, email, password, role, photo });
      await newUser.save();
  
      res.status(201).json({ message: "✅ Utilisateur créé avec succès", user: newUser });
    } catch (error) {
      res.status(500).json({ message: "❌ Erreur lors de l'enregistrement", error });
    }
  };
  
  exports.createAdmin = async (req, res) => {
    try {
      const adminExists = await User.findOne({ role: "admin" });
  
      if (adminExists) {
        return res.status(400).json({ message: "❌ Un admin existe déjà !" });
      }
  
      const { nom, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newAdmin = new User({
        nom,
        email,
        password: hashedPassword,
        role: "admin",
      });
  
      await newAdmin.save();
      res.status(201).json({ message: "✅ Admin créé avec succès !" });
    } catch (error) {
      res.status(500).json({ message: "❌ Erreur serveur", error });
    }
  };

  exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Vérifier si l'utilisateur existe
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "❌ Utilisateur non trouvé !" });
      }
  
      // Comparer le mot de passe avec celui dans la base de données
      const match = await bcrypt.compare(password, user.password);
  
      if (!match) {
        return res.status(400).json({ message: "❌ Mot de passe incorrect !" });
      }
  
      // Créer un token JWT
      const token = jwt.sign(
        { userId: user._id, role: user.role },  
        process.env.JWT_SECRET,               
        { expiresIn: "1h" }                  
      );
  
      // Retourner une réponse avec le token
      res.status(200).json({
        message: "✅ Connexion réussie !",
        token,                                  
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          nom: user.nom,
          photo: user.photo,                  
        }
      });
    } catch (error) {
      console.error("❌ Erreur lors de la connexion:", error);
      res.status(500).json({ message: "❌ Erreur serveur lors de la connexion" });
    }
  };

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la récupération des utilisateurs", error });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "❌ Utilisateur non trouvé" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la récupération de l'utilisateur", error });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { nom, email, photo, password } = req.body;  // On récupère également le mot de passe

    // Vérification de l'existence de l'utilisateur
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "❌ Utilisateur introuvable." });
    }

    // Vérification que l'utilisateur connecté modifie son propre profil (et non celui d'un autre utilisateur)
    if (currentUser._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "❌ Vous ne pouvez pas modifier le profil d'un autre utilisateur." });
    }

    // Création d'un objet avec les données à mettre à jour
    const updatedData = {
      nom: nom || currentUser.nom,  // Met à jour le nom uniquement si fourni
      email: email || currentUser.email,  // Met à jour l'email uniquement si fourni
      photo: req.file ? `/uploads/users/${req.file.filename}` : currentUser.photo,  // Mise à jour de la photo si une nouvelle est envoyée
    };

    // Si un mot de passe est fourni, on le hache et on l'ajoute aux données à mettre à jour
    if (password) {
      const salt = await bcrypt.genSalt(10);  // Création du sel
      updatedData.password = await bcrypt.hash(password, salt);  // Hachage du mot de passe
    }

    // Mise à jour de l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

    res.status(200).json({
      message: "✅ Profil mis à jour avec succès.",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la mise à jour du profil.", error });
  }
};




exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "❌ Utilisateur non trouvé" });

    res.json({ message: "✅ Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors de la suppression", error });
  }
};
