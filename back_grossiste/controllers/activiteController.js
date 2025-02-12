const ActiviteCommerciale = require('../models/ActiviteCommerciale');
const Commercial = require('../models/Commercial');
const Produit = require('../models/Produits');

// Ajouter des produits pris
exports.addProduitsPris = async (req, res) => {
    try {
        const { commercialId } = req.params;
        const { produitsPris } = req.body;

        // Vérifier si le commercial existe
        const commercial = await Commercial.findById(commercialId);
        if (!commercial) {
            return res.status(404).json({ message: 'Commercial non trouvé' });
        }

        // Créer une activité commerciale ou mettre à jour si elle existe déjà
        const activite = await ActiviteCommerciale.findOneAndUpdate(
            { commercialId },
            { $push: { produitsPris: produitsPris } },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Produits pris ajoutés avec succès', activite });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Ajouter des produits retournés
exports.addProduitsRetournes = async (req, res) => {
    try {
        const { commercialId } = req.params;
        const { produitsRetournes } = req.body;

        // Vérifier si le commercial existe
        const commercial = await Commercial.findById(commercialId);
        if (!commercial) {
            return res.status(404).json({ message: 'Commercial non trouvé' });
        }

        // Mettre à jour l'activité commerciale pour ajouter les produits retournés
        const activite = await ActiviteCommerciale.findOneAndUpdate(
            { commercialId },
            { $push: { produitsRetournes: produitsRetournes } },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Produits retournés ajoutés avec succès', activite });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Ajouter un paiement effectué par le commercial
exports.addPaiement = async (req, res) => {
    try {
        const { commercialId } = req.params;
        const { montant } = req.body;

        // Vérifier si le commercial existe
        const commercial = await Commercial.findById(commercialId);
        if (!commercial) {
            return res.status(404).json({ message: 'Commercial non trouvé' });
        }

        // Ajouter un paiement à l'activité commerciale
        const activite = await ActiviteCommerciale.findOneAndUpdate(
            { commercialId },
            {
                $push: {
                    paiements: { montant, statut: montant >= 0 ? "complet" : "partiel" }
                },
                $inc: { dette: -montant } // Réduire la dette du commercial
            },
            { new: true }
        );

        res.status(200).json({ message: 'Paiement ajouté avec succès', activite });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer l'historique des activités commerciales d'un commercial
exports.getActiviteCommerciale = async (req, res) => {
    try {
        const { commercialId } = req.params;

        // Vérifier si le commercial existe
        const commercial = await Commercial.findById(commercialId);
        if (!commercial) {
            return res.status(404).json({ message: 'Commercial non trouvé' });
        }

        // Récupérer l'activité commerciale du commercial
        const activite = await ActiviteCommerciale.findOne({ commercialId });
        if (!activite) {
            return res.status(404).json({ message: 'Aucune activité trouvée pour ce commercial' });
        }

        res.status(200).json(activite);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
