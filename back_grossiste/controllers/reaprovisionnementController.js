const Refacturation = require('../models/Refacturation');

const addRefacturation = async (req, res) => {
  try {
    const { montant, date, raison } = req.body;
    const newRefacturation = new Refacturation({ montant, date, raison });
    await newRefacturation.save();
    res.status(201).json({ message: 'Refacturation ajoutée avec succès', refacturation: newRefacturation });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la refacturation', error });
  }
};
const getRefacturations = async (req, res) => {
    try {
      const refacturations = await Refacturation.find(); // Find all entries in the 'Refacturation' collection
      res.status(200).json({ message: 'Refacturations récupérées avec succès', refacturations });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des refacturations', error });
    }
  };
  
  const getRefacturationsPeriode = async (req, res) => {
    try {
        const { periode } = req.params; // "journalier", "hebdomadaire", "mensuel", "annuel", "global"
        let dateDebut, dateFin;
        const maintenant = new Date();
        let totalMontant = 0; // Initialisation du montant total

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

            case 'global':
                // Pas de filtre par date pour "global"
                const refacturationsGlobal = await Refacturation.find(); // Récupère toutes les refacturations
                totalMontant = refacturationsGlobal.reduce((acc, refacturation) => acc + refacturation.montant, 0);
                return res.status(200).json({
                    periode: 'global',
                    totalMontant: totalMontant,
                });

            default:
                return res.status(400).json({ message: 'Période non valide' });
        }

        // Si la période est différente de "global", on filtre par date
        const refacturations = await Refacturation.find({
            date: {
                $gte: dateDebut,
                $lte: dateFin
            }
        });

        // Calculer le total des montants pour la période spécifiée
        totalMontant = refacturations.reduce((acc, refacturation) => acc + refacturation.montant, 0);

        res.status(200).json({
            periode,
            totalMontant: totalMontant,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


module.exports = { addRefacturation,getRefacturations,getRefacturationsPeriode};