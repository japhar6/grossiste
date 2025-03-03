const Personnel = require('../models/Personnels');

// Ajouter un personnel
exports.ajouterPersonnel = async (req, res) => {
    try {
        const { nom, poste, telephone, adresse, salaireBrut,modePaiement } = req.body;

        if (!nom || !poste || !telephone || salaireBrut === undefined) {
            return res.status(400).json({ message: 'Veuillez remplir tous les champs obligatoires, y compris le salaire.' });
        }

        if (isNaN(salaireBrut) || salaireBrut < 0) {
            return res.status(400).json({ message: 'Le salaire doit être un nombre positif.' });
        }

        const nouveauPersonnel = new Personnel({
            nom,
            poste,
            telephone,
            adresse,
            salaireBrut,modePaiement
        });

        const personnelEnregistre = await nouveauPersonnel.save();
        res.status(201).json(personnelEnregistre);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du personnel :', error);
        res.status(500).json({ message: 'Une erreur est survenue, veuillez réessayer plus tard.' });
    }
};
const moment = require('moment'); // Assure-toi que moment.js est installé

// Fonction pour générer la période selon le mode de paiement
const generatePaymentPeriod = (modePaiement, datePaiement) => {
    const date = moment(datePaiement); // On part de la date de paiement

    if (modePaiement === 'mensuel') {
        // Format "Mois Année" (ex : Mars 2025)
        return date.format('MMMM YYYY');
    } else if (modePaiement === 'hebdomadaire') {
        // Format "Semaine X - Année" (ex : Semaine 9 - 2025)
        return `Semaine ${date.week()} - ${date.year()}`;
    } else if (modePaiement === 'journalier') {
        // Format "Jour/Mois/Année" (ex : 03/03/2025)
        return date.format('DD/MM/YYYY');
    } else {
        // Si jamais le mode de paiement n'est pas reconnu
        throw new Error('Mode de paiement non valide');
    }
};

// Enregistrer un paiement de salaire
exports.enregistrerPaiement = async (req, res) => {
    try {
        console.log("📌 Début de l'enregistrement du paiement...");

        // Récupérer les paramètres de la requête
        const { id } = req.params;
        const { montant } = req.body; // "periode" sera calculé automatiquement en fonction du modePaiement

        // Récupérer le personnel
        const personnel = await Personnel.findById(id);
        if (!personnel) {
            console.error(`❌ Erreur : Aucun personnel trouvé avec l'ID ${id}`);
            return res.status(404).json({ message: 'Personnel non trouvé.' });
        }

        console.log("➡️ Personnel trouvé :", personnel.nom);

        // Générer la période en fonction du mode de paiement
        const periode = generatePaymentPeriod(personnel.modePaiement, new Date());

        // Vérifier si le montant est valide
        if (isNaN(montant) || montant <= 0) {
            console.error("❌ Erreur : Montant incorrect.");
            return res.status(400).json({ message: 'Veuillez fournir un montant positif.' });
        }

        // Ajouter le paiement à l'historique
        personnel.historiquePaiements.push({
            periode, 
            montant,
            datePaiement: new Date()
        });

        console.log("💾 Sauvegarde du paiement...");
        await personnel.save();

        console.log("✅ Paiement enregistré avec succès !");
        res.status(200).json({ message: 'Paiement enregistré avec succès.', personnel });

    } catch (error) {
        console.error("🚨 Erreur lors de l'enregistrement du paiement :", error);
        res.status(500).json({ message: 'Impossible d\'enregistrer le paiement.' });
    }
};

    
// Récupérer l'historique des paiements d'un personnel
exports.getHistoriquePaiements = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("📥 Requête reçue pour l'historique des paiements du personnel avec ID:", id);
        
        // Récupérer le personnel
        const personnel = await Personnel.findById(id);
        
        if (!personnel) {
            return res.status(404).json({ message: 'Personnel non trouvé' });
        }
        console.log("📊 Historique des paiements trouvé pour :", personnel.nom);
        // Retourner l'historique des paiements
        res.status(200).json({ historiquePaiements: personnel.historiquePaiements });

    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique des paiements :", error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'historique' });
    }
};

// Récupérer l'historique des paiements d'un employé
exports.getHistoriquePaiements = async (req, res) => {
    try {
        const personnel = await Personnel.findById(req.params.id);
        if (!personnel) {
            return res.status(404).json({ message: 'Personnel non trouvé.' });
        }

        res.status(200).json(personnel.historiquePaiements);
    } catch (error) {
        console.error('Erreur lors de la récupération des paiements :', error);
        res.status(500).json({ message: 'Impossible de récupérer l\'historique des paiements.' });
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
