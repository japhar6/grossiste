const FondRistourne = require('../models/FondRistourne');

exports.getFondRistourneDetails = async (req, res) => {
    try {
        // Récupérer tous les fonds de ristourne
        const fondsRistourne = await FondRistourne.find()
        .populate('fournisseur', 'nom conditions.typeRistourne')

        .populate('panier');

        if (!fondsRistourne || fondsRistourne.length === 0) {
            return res.status(404).json({ message: "Aucun FondRistourne trouvé" });
        }

        // Récupérer les informations des achats pour chaque fondRistourne
        const fondsDetails = await Promise.all(fondsRistourne.map(async (fond) => {
        

            return {
                fournisseur: fond.fournisseur.nom,
                montantRistourne: fond.montantRistourne,
                statut: fond.statut,
                dateAchat: fond.dateAchat
            };
        }));

        // Retourner les informations des fonds
        res.status(200).json(fondsDetails);

    } catch (error) {
        console.error("Erreur lors de la récupération des FondRistourne:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.getFondsByFournisseur = async (req, res) => {
    try {
        const { fournisseurId } = req.params; // Récupère l'ID du fournisseur depuis l'URL

        const fonds = await FondRistourne.find({ fournisseur: fournisseurId })
            .select('refact fournisseur dateAchat montantRistourne') // Sélectionner uniquement ces champs
            .populate('fournisseur', 'nom'); // Optionnel : récupérer le nom du fournisseur

        if (!fonds.length) {
            return res.status(404).json({ message: "Aucun fond de ristourne trouvé pour ce fournisseur." });
        }

        res.status(200).json(fonds);
    } catch (error) {
        console.error("Erreur lors de la récupération des fonds de ristourne :", error);
        res.status(500).json({ message: "Une erreur est survenue." });
    }
};
