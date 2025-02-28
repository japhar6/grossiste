const Paiement = require("../models/Paiement");
const Commande = require("../models/Commandes");
const PaiementCommerciale = require("../models/PaimentCommerciale");
const { sendNotificationToAdmin } = require('../service/payementService'); // Service de notification


const mongoose = require("mongoose");
exports.validerpayement = async (req, res) => {
    try {
        const { id } = req.params;  // Référence de la commande (ex : "FACTCLI-001")
        const { idCaissier, referencePaiement, modePaiement, dateLimiteCredit } = req.body; // Récupérer les données de la requête

        // Recherche de la commande par la référence de facture (id)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de commande invalide" });
        }

        const commande = await Commande.findById(id);

        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Si le mode de paiement est "mobile money" ou "virement bancaire", la référence de paiement est requise
        if ((modePaiement === "mobile money" || modePaiement === "virement bancaire") && !referencePaiement) {
            return res.status(400).json({ message: "La référence de paiement est requise pour ce mode de paiement" });
        }

        // Si le mode de paiement est "à crédit", vérifier que la date limite est fournie
        if (modePaiement === "a credit" && !dateLimiteCredit) {
            return res.status(400).json({ message: "La date limite de paiement à crédit est requise." });
        }

        // Calcul du montant à payer (aucune remise, juste la somme totale de la commande)
        let montantPaye = commande.totalGeneral;

        // Mettre à jour le statut de la commande à "payé"
        commande.statut = "payé";
        await commande.save();

        // Si le mode de paiement est "mobile money" ou "virement bancaire", le statut du paiement sera "payé partielle"
        let statutPaiement = "payé complet";
       
        // Créer un paiement avec le montant payé et d'autres détails, incluant le mode de paiement et la date limite pour les paiements à crédit
        const paiement = new Paiement({
            commandeId: commande._id,  // Référence à l'ID de la commande
            montantPaye: montantPaye,  // Montant payé basé sur la commande
            totalPaiement: montantPaye,  // Le montant total payé est le même ici
            statut: statutPaiement,  // Statut du paiement (payé partielle ou payé complet)
            referencePaiement: referencePaiement,  // Référence de paiement, si nécessaire
            idCaissier: idCaissier,
            modePaiement: modePaiement,  // Mode de paiement
            dateLimiteCredit: modePaiement === "a credit" ? dateLimiteCredit : null // Ajout de la date limite si le paiement est à crédit
        });

        // Sauvegarder le paiement dans la base de données
        await paiement.save();

        // Réponse avec les détails du paiement validé
        return res.status(200).json({
            message: "Paiement validé avec succès",
            paiement: {
                commandeId: paiement.commandeId,
                montantPaye: paiement.montantPaye,
                statut: paiement.statut,
                totalPaiement: paiement.totalPaiement,
                referencePaiement: paiement.referencePaiement,
                modePaiement: paiement.modePaiement, // Inclure le mode de paiement dans la réponse
                dateLimiteCredit: paiement.dateLimiteCredit // Inclure la date limite de crédit dans la réponse si applicable
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Vérification des paiements à crédit et envoi de notifications
exports.checkPaymentsDue = async (req, res) => {
    try {
      // Récupérer tous les paiements à crédit
      const payments = await Payment.find({ modePaiement: 'à crédit' });
      const today = moment(); // Date actuelle
  
      // Parcours des paiements à crédit
      payments.forEach(payment => {
        const dateLimite = moment(payment.dateLimiteCredit); // Date limite du paiement
  
        // Si la date limite est dépassée
        if (dateLimite.isBefore(today)) {
          // Envoie la notification à l'admin
          sendNotificationToAdmin(payment);
        }
      });
  
      // Répondre que le processus a été effectué
      res.status(200).json({ message: 'Vérification des paiements effectuée avec succès.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Une erreur est survenue lors de la vérification des paiements.' });
    }
  };
  


// Récupérer tous les paiements des client 
exports.getPaiements = async (req, res) => {
    try {
        // Récupérer les paiements clients
        const paiementsClients = await Paiement.find().populate({
            path: 'commandeId',
            populate: [
                { path: 'clientId', select: 'nom' },
                { path: 'commercialId', select: 'nom' }
            ]
        }).populate({
            path:'idCaissier',select:'nom'
        });

        // Récupérer les paiements commerciaux
        const paiementsCommerciaux = await PaiementCommerciale.find()
        .populate({
            path: 'commandeId',
            populate: [
                { path: 'clientId', select: 'nom' },
                { path: 'commercialId', select: 'nom' }
            ]
        }).populate({
            path:'idCaissier',select:'nom'
        });

        // Combiner les deux résultats
        const paiements = {
            clients: paiementsClients.map(paiement => ({
                ...paiement.toObject(),
                clientNom: paiement.commandeId?.clientId?.nom || 'Inconnu', // Nom du client
                commercialNom: paiement.commandeId?.commercialId?.nom || 'Inconnu' // Nom du commercial
            })),
            commerciaux: paiementsCommerciaux.map(paiement => ({
                ...paiement.toObject(),
                clientNom: paiement.commandeId?.clientId?.nom || 'Inconnu',
                commercialNom: paiement.commandeId?.commercialId?.nom || 'Inconnu'
            }))
        };


        res.status(200).json(paiements);
    } catch (error) {
        console.error("Erreur lors de la récupération des paiements:", error);
        res.status(400).json({ message: error.message });
    }
};


// Récupérer un paiement par son ID
exports.getPaiementById = async (req, res) => {
    try {
        const paiement = await Paiement.findById(req.params.id);
        if (!paiement) {
            return res.status(404).json({ message: "Paiement non trouvé" });
        }
        res.status(200).json(paiement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getPaiementsParCaissier = async (req, res) => {
    try {
        const { idCaissier } = req.params;

        // Récupérer les paiements clients avec les détails des commandes
        const paiementsClients = await Paiement.find({ idCaissier: idCaissier })
            .populate({
                path: 'commandeId',
                populate: [
                    { path: 'clientId', select: 'nom' }, // Récupérer le nom du client
                    { path: 'commercialId', select: 'nom' }, // Récupérer le nom du commercial
                    { path: 'produits.produit', select: 'nom prixUnitaire' }, // Nom et prix unitaire des produits
                ]
            });

        // Récupérer les paiements commerciaux avec les détails des commandes
        const paiementsCommerciaux = await PaiementCommerciale.find({ idCaissier: idCaissier })
            .populate({
                path: 'commandeId',
                populate: [
                    { path: 'clientId', select: 'nom' },
                    { path: 'commercialId', select: 'nom' },
                    { path: 'produits.produit', select: 'nom prixUnitaire' },
                    { path: 'modePaiement', select: 'modePaiement' }
                ]
            });

        // Combiner les deux résultats
        const paiements = {
            clients: paiementsClients.map(paiement => ({
                ...paiement.toObject(),
                clientNom: paiement.commandeId?.clientId?.nom || 'Inconnu',
                produits: paiement.commandeId?.produits?.map(produit => ({
                    nom: produit.produit.nom,
                    prixUnitaire: produit.produit.prixUnitaire
                })) || [],
                modePaiement: paiement.modePaiement || 'Inconnu',
                dateLimiteCredit: paiement.modePaiement === 'a credit' ? paiement.dateLimiteCredit : null,
                referencePaiement: (paiement.modePaiement === 'mobile money' || paiement.modePaiement === 'virement bancaire') 
                    ? paiement.referencePaiement 
                    : null
            })),
            commerciaux: paiementsCommerciaux.map(paiement => ({
                ...paiement.toObject(),
                commercialNom: paiement.commandeId?.commercialId?.nom || 'Inconnu',
                produits: paiement.commandeId?.produits?.map(produit => ({
                    nom: produit.produit.nom,
                    prixUnitaire: produit.produit.prixUnitaire
                })) || [],
                modePaiement: paiement.commandeId?.modePaiement || 'Inconnu',
                dateLimiteCredit: paiement.modePaiement === 'a credit' ? paiement.dateLimiteCredit : null,
                referencePaiement: (paiement.modePaiement === 'mobile money' || paiement.modePaiement === 'virement bancaire') 
                    ? paiement.referencePaiement 
                    : null
            }))
        };

        res.status(200).json(paiements);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.getPerformanceVenteParMois = async (req, res) => {
    try {
        const result = await Paiement.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$createdAt" }
                    },
                    totalMontant: { $sum: "$montantPaye" },
                    totalPaiement: { $sum: "$totalPaiement" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        console.error("Erreur lors de la récupération des performances :", err);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des performances"
        });
    }
};

exports.getPaiementAvecCommande = async (req, res) => {
    try {
        const { paiementId } = req.params;

        // Récupérer les paiements clients avec les détails des commandes
        const paiementsClients = await Paiement.find({ paiementId: paiementId })
            .populate({
                path: 'commandeId',
                populate: [
                    { path: 'clientId', select: 'nom' }, // Récupérer le nom du client
                    { path: 'commercialId', select: 'nom' }, // Récupérer le nom du commercial
                    { path: 'produits.produit', select: 'nom' }, // Nom et prix unitaire des produits
                    { path: 'modePaiement', select: 'modePaiement' } 
                ]
            });

        // Récupérer les paiements commerciaux avec les détails des commandes
        const paiementsCommerciaux = await PaiementCommerciale.find({ paiementId: paiementId })
            .populate({
                path: 'commandeId',
                populate: [
                    { path: 'clientId', select: 'nom' }, // Récupérer le nom du client
                    { path: 'commercialId', select: 'nom' }, // Récupérer le nom du commercial
                    { path: 'produits.produit', select: 'nom' }, // Nom et prix unitaire des produits
                    { path: 'modePaiement', select: 'modePaiement' } 
                ]
            });

        // Ajout du type pour indiquer si c'est un client ou un commercial
        const paiements = {
            clients: paiementsClients.map(paiement => {
                const modePaiementClient = paiement.commandeId?.modePaiement || 'Inconnu';
                return {
                    type: 'client',
                    ...paiement.toObject(),
                    clientNom: paiement.commandeId?.clientId?.nom || 'Inconnu',
                    produits: paiement.commandeId?.produits?.map(produit => ({
                        nom: produit.produit.nom,
                        prixUnitaire: produit.prixUnitaire,
                        quantite: produit.quantite // Correction ici : accès à quantite directement sur produit
                    })) || [],
                    remiseFixe: paiement.remiseFixe || 0, // Remise fixe sur le paiement
                    remiseGlobale: paiement.remiseGlobale || 0, // Remise globale sur le paiement
                    remiseParProduit: paiement.remiseParProduit || [],
                    modePaiement: modePaiementClient
                };
            }),
            commerciaux: paiementsCommerciaux.map(paiement => {
                const modePaiementCommercial = paiement.commandeId?.modePaiement || 'Inconnu';
                return {
                    type: 'commercial',
                    ...paiement.toObject(),
                    commercialNom: paiement.commandeId?.commercialId?.nom || 'Inconnu',
                    produits: paiement.commandeId?.produits?.map(produit => ({
                        nom: produit.produit.nom,
                        prixUnitaire: produit.prixUnitaire,
                        quantite: produit.quantite // Correction ici : accès à quantite directement sur produit
                    })) || [],
                    remiseFixe: paiement.remiseFixe || 0, // Remise fixe sur le paiement
                    remiseGlobale: paiement.remiseGlobale || 0, // Remise globale sur le paiement
                    remiseParProduit: paiement.remiseParProduit || [],
                    modePaiement: modePaiementCommercial
                };
            })
        };

        res.status(200).json(paiements);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getTotalPaiementsParPeriode = async (req, res) => {
    try {
        const { periode } = req.params; // "journalier", "hebdomadaire", "mensuel", "annuel", "global"
        let dateDebut, dateFin;

        const maintenant = new Date();

        switch (periode) {
            case 'journalier':
                // Récupère la date actuelle à 00:00 et 23:59
                dateDebut = new Date(maintenant);
                dateDebut.setHours(0, 0, 0, 0);  // Met à 00:00
                dateFin = new Date(maintenant);
                dateFin.setHours(23, 59, 59, 999);  // Met à 23:59
                break;

            case 'hebdomadaire':
                // Récupère le premier et dernier jour de la semaine
                const premierJourSemaine = maintenant.getDate() - maintenant.getDay(); // Dimanche = 0
                dateDebut = new Date(maintenant);
                dateDebut.setDate(premierJourSemaine);
                dateDebut.setHours(0, 0, 0, 0);  // Début de la semaine (dimanche)
                dateFin = new Date(maintenant);
                dateFin.setDate(premierJourSemaine + 6);  // Fin de la semaine (samedi)
                dateFin.setHours(23, 59, 59, 999);  // Fin de la semaine
                break;

            case 'mensuel':
                // Récupère le premier et dernier jour du mois
                dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);  // Premier jour du mois
                dateFin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);  // Dernier jour du mois
                dateFin.setHours(23, 59, 59, 999);  // Fin du mois
                break;

            case 'annuel':
                // Récupère le premier et dernier jour de l'année
                dateDebut = new Date(maintenant.getFullYear(), 0, 1);  // Premier jour de l'année
                dateFin = new Date(maintenant.getFullYear(), 11, 31);  // Dernier jour de l'année
                dateFin.setHours(23, 59, 59, 999);  // Fin de l'année
                break;

            case 'global':
                // Aucun filtre de date, on prend tout
                const paiementsClients = await Paiement.find().populate({
                    path: 'commandeId',
                    populate: [
                        { path: 'clientId', select: 'nom' },
                        { path: 'commercialId', select: 'nom' }
                    ]
                }).populate({
                    path: 'idCaissier', select: 'nom'
                });

                const totalGlobalClients = paiementsClients.reduce((acc, paiement) => acc + paiement.montantPaye, 0);

                const paiementsCommerciaux = await PaiementCommerciale.find().populate({
                    path: 'commandeId',
                    populate: [
                        { path: 'clientId', select: 'nom' },
                        { path: 'commercialId', select: 'nom' }
                    ]
                }).populate({
                    path: 'idCaissier', select: 'nom'
                });

                const totalGlobalCommerciaux = paiementsCommerciaux.reduce((acc, paiement) => acc + paiement.montantPaye, 0);

                return res.status(200).json({
                    periode: 'global',
                    totalClients: totalGlobalClients,
                    totalCommerciaux: totalGlobalCommerciaux,
                    nombreClients: paiementsClients.length,
                    nombreCommerciaux: paiementsCommerciaux.length
                });

            default:
                return res.status(400).json({ message: 'Période non valide' });
        }

        // Filtrage des paiements par date pour les périodes autres que "global"
        const modePaiementFiltre = req.query.modePaiement || "tous";  // Filtrage optionnel par mode de paiement

        // Récupère les paiements clients
        const paiementsClients = await Paiement.find({
            datePaiement: {
                $gte: dateDebut,
                $lte: dateFin
            },
            ...(modePaiementFiltre !== "tous" && { modePaiement: modePaiementFiltre === "espèce" ? "espèce" : { $ne: "espèce" } })
        }).populate({
            path: 'commandeId',
            populate: [
                { path: 'clientId', select: 'nom' },
                { path: 'commercialId', select: 'nom' }
            ]
        }).populate({
            path: 'idCaissier', select: 'nom'
        });

        const totalClients = paiementsClients.reduce((acc, paiement) => acc + paiement.montantPaye, 0);

        // Récupère les paiements commerciaux
        const paiementsCommerciaux = await PaiementCommerciale.find({
            datePaiement: {
                $gte: dateDebut,
                $lte: dateFin
            },
            ...(modePaiementFiltre !== "tous" && { modePaiement: modePaiementFiltre === "espèce" ? "espèce" : { $ne: "espèce" } })
        }).populate({
            path: 'commandeId',
            populate: [
                { path: 'clientId', select: 'nom' },
                { path: 'commercialId', select: 'nom' }
            ]
        }).populate({
            path: 'idCaissier', select: 'nom'
        });

        const totalCommerciaux = paiementsCommerciaux.reduce((acc, paiement) => acc + paiement.montantPaye, 0);

        // Retourne la réponse avec les paiements clients et commerciaux
        res.status(200).json({
            periode,
            totalClients,
            totalCommerciaux,
            nombreClients: paiementsClients.length,
            nombreCommerciaux: paiementsCommerciaux.length
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des paiements:", error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};


