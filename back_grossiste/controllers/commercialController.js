const Commercial = require('../models/Commercial');

// Créer un commercial
exports.createCommercial = async (req, res) => {
    try {
        const { nom, email,telephone } = req.body;

        const newCommercial = new Commercial({
            nom,
            email,telephone
        });

        await newCommercial.save();
        res.status(201).json({ message: "Commercial créé avec succès", commercial: newCommercial });
    } catch (error) {
        res.status(400).json({ message: error.message });
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
