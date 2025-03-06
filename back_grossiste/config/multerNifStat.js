const multer = require('multer');
const path = require('path');

// Définition du stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/nifstat/'); // Dossier où seront stockées les images
  },
  filename: function (req, file, cb) {
     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
     cb(null, uniqueSuffix + path.extname(file.originalname)); // Nom unique pour éviter les conflits
   }
});

// Filtrer les fichiers pour accepter seulement les images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('Seuls les fichiers JPEG, JPG et PNG sont autorisés !'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Taille max : 5MB
});

module.exports = upload;
