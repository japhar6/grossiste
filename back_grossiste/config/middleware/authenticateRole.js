const authenticateRole = (roles) => {
    return (req, res, next) => {
      const userRole = req.user?.role;  // Récupérer le rôle de l'utilisateur à partir du token décodé
  
      if (!roles.includes(userRole)) {
        return res.status(403).json({ message: "❌ Accès interdit. Vous n'avez pas les droits nécessaires." });
      }
  
      next();  // Si l'utilisateur a un rôle valide, on passe à la route suivante
    };
  };
  
  module.exports = authenticateRole;
  