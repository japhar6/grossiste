const authenticateMagasinier = (req, res, next) => {
    // Vérifier que l'utilisateur est authentifié et possède un rôle
    if (!req.user) {
      return res.status(401).json({ message: "❌ Accès non autorisé. Veuillez vous authentifier." });
    }
  
    // Autoriser si l'utilisateur est admin ou magasinier
    if (req.user.role === 'admin' || req.user.role === 'magasinier') {
      return next();
    }
  
    // Sinon, bloquer l'accès
    return res.status(403).json({ message: "❌ Accès interdit. Seul un magasinier ou un admin peut gérer les entrepôts." });
  };
  
  module.exports = authenticateMagasinier;
  