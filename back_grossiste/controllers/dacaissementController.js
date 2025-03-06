const Decaissement = require("../models/Decaissement");
const FondCaisse = require("../models/FondCaisse");

exports.effectuerDecaissement = async (req, res) => {
    try {
        const { periode, montantDecaisse, modePaiement, referencePaiement } = req.body;

        if (!montantDecaisse || montantDecaisse <= 0) {
            return res.status(400).json({ message: "Le montant de décaissement doit être supérieur à 0" });
        }

        if (modePaiement !== 'espèce' && !referencePaiement) {
            return res.status(400).json({ message: "La référence de paiement est requise pour ce mode de paiement" });
        }

        const fondsCaisse = await FondCaisse.find(); // Récupérer tous les fonds de caisse disponibles
        if (!fondsCaisse || fondsCaisse.length === 0) {
            return res.status(404).json({ message: "Aucun fond de caisse disponible" });
        }

        let montantRestant = montantDecaisse;
        for (let i = 0; i < fondsCaisse.length; i++) {
            const fondCaisse = fondsCaisse[i];

            if (fondCaisse.totalPaiement <= 0) {
                continue; // Si le fond de caisse est vide, on passe au suivant
            }

            // Si le fond de caisse peut couvrir tout ou partie du décaissement
            if (fondCaisse.totalPaiement >= montantRestant) {
                fondCaisse.totalPaiement -= montantRestant;
                montantRestant = 0;
                await fondCaisse.save();
                break; // Le décaissement est terminé
            } else {
                // Si le fond de caisse ne suffit pas, on l'épuise
                montantRestant -= fondCaisse.totalPaiement;
                fondCaisse.totalPaiement = 0;
                await fondCaisse.save();
            }
        }

        if (montantRestant > 0) {
            return res.status(400).json({ message: "Le montant de décaissement dépasse le solde disponible dans tous les fonds de caisse" });
        }

        const nouveauDecaissement = await Decaissement.create({
            montant: montantDecaisse,
            mode: modePaiement || 'virement bancaire',
            referencePaiement: modePaiement !== 'espèce' ? referencePaiement : undefined,
            dateDecaissement: new Date(),
            periode,
        });

        await nouveauDecaissement.save();

        res.status(200).json({
            message: "Décaissement effectué avec succès",
            nouveauDecaissement,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getTousLesDecaissements = async (req, res) => {
    try {
        // Récupérer tous les décaissements
        const decaissements = await Decaissement.find();

        if (decaissements.length === 0) {
            return res.status(404).json({ message: "Aucun décaissement trouvé" });
        }

        res.status(200).json({
            message: "Liste des décaissements récupérée avec succès",
            decaissements,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des décaissements' });
    }
};

