const Personnel = require('../models/Personnels');

// Créer un nouveau personnel
exports.ajouterPersonnel = async (req, res) => {
    try {
        const { nom, poste, telephone, adresse } = req.body;

        if (!nom || !poste || !telephone) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires.' });
        }

        const nouveauPersonnel = new Personnel({
            nom,
            poste,
            telephone,
            adresse
        });

        const personnelEnregistre = await nouveauPersonnel.save();
        res.status(201).json(personnelEnregistre);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du personnel :', error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer plus tard.' });
    }
};

// Récupérer tous les personnels
exports.getAllPersonnels = async (req, res) => {
    try {
        const personnels = await Personnel.find();
        res.status(200).json(personnels);
    } catch (error) {
        console.error('Erreur lors de la récupération des personnels :', error);
        res.status(500).json({ message: 'Impossible de récupérer les personnels.' });
    }
};

// Récupérer un personnel par son ID
exports.getPersonnelById = async (req, res) => {
    try {
        const personnel = await Personnel.findById(req.params.id);
        if (!personnel) {
            return res.status(404).json({ message: 'Personnel non trouvé.' });
        }
        res.status(200).json(personnel);
    } catch (error) {
        console.error('Erreur lors de la récupération du personnel :', error);
        res.status(500).json({ message: 'Une erreur est survenue.' });
    }
};

// Mettre à jour un personnel
exports.updatePersonnel = async (req, res) => {
    try {
        const personnel = await Personnel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!personnel) {
            return res.status(404).json({ message: 'Personnel non trouvé.' });
        }
        res.status(200).json(personnel);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du personnel :', error);
        res.status(500).json({ message: 'Mise à jour échouée.' });
    }
};

// Supprimer un personnel
exports.deletePersonnel = async (req, res) => {
    try {
        const personnel = await Personnel.findByIdAndDelete(req.params.id);
        if (!personnel) {
            return res.status(404).json({ message: 'Personnel non trouvé.' });
        }
        res.status(200).json({ message: 'Personnel supprimé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression du personnel :', error);
        res.status(500).json({ message: 'Suppression échouée.' });
    }
};
