const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: "❌ Accès non autorisé. Aucun token fourni." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // Ajouter l'utilisateur décodé à la requête pour l'utiliser dans les routes
    next();  // Passer à la prochaine fonction ou route
  } catch (error) {
    return res.status(400).json({ message: "❌ Token invalide" });
  }
};

module.exports = authenticateJWT;
