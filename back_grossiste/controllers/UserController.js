const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: require('path').resolve(__dirname, '../../../.env') });

exports.register = async (req, res) => {
    try {
      const { nom, email, password, role ,numero_cin} = req.body;
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "❌ Cet email est déjà utilisé" });
      }
  
      const photo = req.file ? `/uploads/users/${req.file.filename}` : null;
  
      const newUser = new User({ nom, email, password, role, photo,numero_cin });
      await newUser.save();
  
      res.status(201).json({ message: "✅ Utilisateur créé avec succès", user: newUser });
    } catch (error) {
      res.status(500).json({ message: "❌ Erreur lors de l'enregistrement", error });
    }
  };
  
  exports.createAdmin = async (req, res) => {
    try {
      // Vérifier si un admin existe déjà
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists) {
        return res.status(400).json({ message: "❌ Un admin existe déjà !" });
      }

      // Extraire les informations du body
      const { nom, email, password, role,numero_cin } = req.body;
  
      // Vérifier si l'email est déjà utilisé
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "❌ Cet email est déjà utilisé" });
      }
      // Gérer l'upload de la photo si nécessaire
      const photo = req.file ? `/uploads/users/${req.file.filename}` : null;
  
     
      const newUser = new User({ nom, email,  password, role, photo,numero_cin });
  
      // Sauvegarder l'utilisateur dans la base de données
      await newUser.save();
  
      // Retourner la réponse de succès
      res.status(201).json({ message: "✅ Utilisateur créé avec succès", user: newUser });
  
    } catch (error) {
      // Si une erreur se produit, renvoyer une erreur générique
      res.status(500).json({ message: "❌ Erreur lors de l'enregistrement de l'utilisateur", error: error.message });
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

        // Vérifier si l'utilisateur est licencié
        if (user.status === "licencié") {
            return res.status(403).json({ message: "❌ Vous êtes licencié et ne pouvez plus accéder à la plateforme." });
        }

        // Comparer le mot de passe
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ message: "❌ Mot de passe incorrect !" });
        }

        // Générer le token uniquement si l'utilisateur est actif
        const token = jwt.sign(
            { userId: user._id, role: user.role },  
            process.env.JWT_SECRET,               
            { expiresIn: "3h" }                  
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
exports.countUsersByRole = async (req, res) => {
  try {
    // Compter les utilisateurs par rôle
    const roleCounts = await User.aggregate([
      { $unwind: "$role" }, 
      {
        $group: {
          _id: "$role", 
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } 
    ]);

    // Répondre avec les résultats
    res.json(roleCounts);
  } catch (error) {
    res.status(500).json({ message: "❌ Erreur lors du comptage des utilisateurs par rôle", error });
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
    const { nom, email, photo, password,numero_cin} = req.body;  

 
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "❌ Utilisateur introuvable." });
    }

 

    // Création d'un objet avec les données à mettre à jour
    const updatedData = {
      nom: nom || currentUser.nom, 
      numero_cin: numero_cin || currentUser.numero_cin,  
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
exports.licencierEmploye = async (req, res) => {
  const { employeId } = req.params; 

  try {
    // Trouver et mettre à jour l'employé pour le licencier (mettre le status à 'licencié')
    const employe = await User.findByIdAndUpdate(
      employeId,
      { status: "licencié" },
      { new: true }  // Retourner le document mis à jour
    );

    if (!employe) {
      return res.status(404).json({ message: "Employé non trouvé" });
    }

    res.status(200).json({
      message: "Employé licencié avec succès",
      employe
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }}