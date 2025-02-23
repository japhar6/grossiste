const CommissionCom = require('../models/CommissionCom'); // Assurez-vous d'importer votre modèle
const VenteCom = require('../models/VenteComm'); // Assurez-vous d'importer votre modèle
const moment = require('moment'); // Assure-toi d'installer moment.js
    exports.calculerEtAjouterCommission = async (req, res) => {
        try {
            console.log('Requête reçue pour calculer la commission');

            const { commercialId, typeCommission, montant, periode } = req.body;

            if (!commercialId || !typeCommission || !montant || !periode) {
                return res.status(400).json({ message: "Tous les champs sont requis : commercialId, typeCommission, montant, periode." });
            }

            // Définir les dates de début et de fin en fonction de la période
            const today = moment();
            let startDate, endDate;

            if (periode === 'mensuel') {
                startDate = today.startOf('month').toDate();
                endDate = today.endOf('month').toDate();
            } else if (periode === 'hebdomadaire') {
                startDate = today.utc().startOf('isoWeek').toDate(); // Lundi à minuit UTC
                endDate = today.utc().endOf('isoWeek').toDate(); // Dimanche 23:59:59 UTC
        
            } else {
                return res.status(400).json({ message: "Période invalide. Utilisez 'mensuel' ou 'hebdomadaire'." });
            }

            // Récupérer les ventes du commercial pour la période spécifiée
            const ventes = await VenteCom.find({
                commercialId,
                dateVente: { $gte: startDate, $lte: endDate }
            });

            if (!ventes || ventes.length === 0) {
                return res.status(404).json({ message: "Aucune vente trouvée pour cette période." });
            }

            // Calculer le montant total des ventes
            const montantTotalVentes = ventes.reduce((total, vente) => total + vente.montantTotal, 0);

            let montantCommission = 0;

            // Appliquer la commission en fonction du type
            if (typeCommission === 'pourcentage') {
                montantCommission = (montantTotalVentes * montant) / 100;
            } else if (typeCommission === 'montantFixe') {
                montantCommission = montant;
            } else {
                return res.status(400).json({ message: "Type de commission invalide. Utilisez 'pourcentage' ou 'montantFixe'." });
            }

            // Enregistrer la commission calculée
            const nouvelleCommission = new CommissionCom({
                commercialId,
                montant: montantCommission,
                typeCommission,
                periode,
                statut: 'en_attente'
            });

            await nouvelleCommission.save();

            res.status(201).json({
                message: "Commission ajoutée avec succès.",
                montantCommission,
                commercialId,
                periode,
                typeCommission
            });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };


// Route pour calculer et ajouter la commission

