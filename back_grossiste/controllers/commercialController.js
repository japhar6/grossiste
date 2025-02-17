const Commercial = require('../models/Commercial');

// Créer un commercial
exports.createCommercial = async (req, res) => {
    try {
        const { nom, email, telephone, type } = req.body;
    
        // Vérifie si les champs sont valides
        if (!nom || !telephone || !email || !type) {
          return res.status(400).json({ message: "Les champs sont manquants" });
        }
    
        // Créer un nouveau commercial
        const newCommercial = new Commercial({ nom, email, telephone, type });
    
        // Sauvegarder dans la base de données
        await newCommercial.save();
    
        return res.status(201).json(newCommercial);
      } catch (error) {
        console.error("Erreur lors de la création du commercial", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
      }
};

// Récupérer tous les commerciaux
exports.getAllCommercials = async (req, res) => {
    try {
        const commerciaux = await Commercial.find();
        res.status(200).json(commerciaux);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer un commercial par ID
exports.getCommercialById = async (req, res) => {
    try {
        const commercial = await Commercial.findById(req.params.id);
        if (!commercial) {
            return res.status(404).json({ message: "Commercial non trouvé" });
        }
        res.status(200).json(commercial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour un commercial
exports.updateCommercial = async (req, res) => {
    try {
        const { nom, email,telephone } = req.body;
        const commercial = await Commercial.findByIdAndUpdate(
            req.params.id, 
            { nom, email,telephone },
            { new: true }
        );
        
        if (!commercial) {
            return res.status(404).json({ message: "Commercial non trouvé" });
        }

        res.status(200).json({ message: "Commercial mis à jour avec succès", commercial });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un commercial
exports.deleteCommercial = async (req, res) => {
    try {
        const commercial = await Commercial.findByIdAndDelete(req.params.id);
        if (!commercial) {
            return res.status(404).json({ message: "Commercial non trouvé" });
        }

        res.status(200).json({ message: "Commercial supprimé avec succès" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
