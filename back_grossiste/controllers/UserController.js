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
        { userId: user._id, role: user.role },  // Payload avec l'ID de l'utilisateur et son rôle
        process.env.JWT_SECRET,                 // Clé secrète pour signer le token
        { expiresIn: "1h" }                    // Durée de validité du token
      );
  
      // Retourner une réponse avec le token
      res.status(200).json({
        message: "✅ Connexion réussie !",
        token,                                  // Inclure le token dans la réponse
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          nom: user.nom,
          photo: user.photo,                    // Si tu as un champ photo pour l'utilisateur
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
      const { nom, email, role } = req.body;
      let updatedData = { nom, email, role };
  
      if (req.file) {
        updatedData.photo = `/uploads/users/${req.file.filename}`;
      }
  
      const updatedUser = await User.findByIdAndUpdate(req.params.id, updatedData, { new: true });
  
      if (!updatedUser) return res.status(404).json({ message: "❌ Utilisateur non trouvé" });
  
      res.json({ message: "✅ Utilisateur mis à jour", user: updatedUser });
    } catch (error) {
      res.status(500).json({ message: "❌ Erreur lors de la mise à jour", error });
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
