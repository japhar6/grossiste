const FoncdCaisse = require("../models/FondCaisse");  // Assurez-vous d'importer le modèle correctement

exports.getTotalFondCaisseParPeriode = async (req, res) => {
    try {
        const { periode } = req.params; // "journalier", "hebdomadaire", "mensuel", "annuel", "global"
        let dateDebut, dateFin;

        const maintenant = new Date();

        switch (periode) {
            case 'journalier':
                dateDebut = new Date(maintenant.setHours(0, 0, 0, 0));
                dateFin = new Date(maintenant.setHours(23, 59, 59, 999));
                break;

            case 'hebdomadaire':
                const premierJourSemaine = maintenant.getDate() - maintenant.getDay(); // Dimanche = 0
                dateDebut = new Date(maintenant.setDate(premierJourSemaine));
                dateDebut.setHours(0, 0, 0, 0);
                dateFin = new Date(maintenant.setDate(premierJourSemaine + 6));
                dateFin.setHours(23, 59, 59, 999);
                break;

            case 'mensuel':
                dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
                dateFin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);
                dateFin.setHours(23, 59, 59, 999);
                break;

            case 'annuel':
                dateDebut = new Date(maintenant.getFullYear(), 0, 1);
                dateFin = new Date(maintenant.getFullYear(), 11, 31);
                dateFin.setHours(23, 59, 59, 999);
                break;

            case 'Total':
                // Pas besoin de filtre par date, on prend tout
                const tousFondCaisse = await FoncdCaisse.find();
                const totalGlobalFondCaisse = tousFondCaisse.reduce((acc, foncCaisse) => acc + foncCaisse.totalPaiement, 0);

                return res.status(200).json({
                    periode: 'Total',
                    totalFondCaisse: totalGlobalFondCaisse,
                    nombrePaiementsFondCaisse: tousFondCaisse.length
                });

            default:
                return res.status(400).json({ message: 'Période non valide' });
        }

        // Si la période est différente de "global", on filtre par date
        const fondCaisse = await FoncdCaisse.find({
            datePaiement: {
                $gte: dateDebut,
                $lte: dateFin
            }
        });

        const totalFondCaisse = fondCaisse.reduce((acc, foncCaisse) => acc + foncCaisse.totalPaiement, 0);

        res.status(200).json({
            periode,
            totalFondCaisse,
            nombrePaiementsFondCaisse: fondCaisse.length
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
