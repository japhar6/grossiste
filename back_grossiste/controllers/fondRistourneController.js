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
