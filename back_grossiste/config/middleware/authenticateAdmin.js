const authenticateAdmin = (req, res, next) => {
    // Vérifier que l'utilisateur est authentifié et possède un rôle
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "❌ Accès interdit. Vous devez être un administrateur." });
    }
  
    // Si l'utilisateur est un admin, passer à la route suivante
    next();
  };
  
  module.exports = authenticateAdmin;
  