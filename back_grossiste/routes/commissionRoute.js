const express = require('express');
const { calculerEtAjouterCommission } = require('../controllers/commissionsController'); // Assure-toi que le chemin est correct
const commissionsController = require('../controllers/commissionsController');

const router = express.Router();
const mongoose = require('mongoose');
// Nouvelle route pour calculer la commission d'un commercial
const Commission = require('../models/CommissionCom'); // Assure-toi d'avoir un modèle Commission

// Récupérer les commissions d'un commercial spécifique
router.get('/commercial/:commercialId', async (req, res) => {
    try {
        const { commercialId } = req.params;
        console.log("ID du commercial reçu :", commercialId); // Debug

        const objectIdCommercial = new mongoose.Types.ObjectId(commercialId); // 🔥 Conversion en ObjectId

        const commissions = await Commission.find({ commercialId: objectIdCommercial });

        if (!commissions.length) {
            console.log("Aucune commission trouvée pour ce commercial.");
            return res.status(404).json({ message: "Aucune commission trouvée pour ce commercial." });
        }

        res.status(200).json(commissions);
    } catch (error) {
        console.error("Erreur lors de la récupération des commissions :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
});

router.post('/commissions/calculer', calculerEtAjouterCommission);
router.get('/totals/:periode', commissionsController.getTotalCommissionsParPeriode);


module.exports = router;
