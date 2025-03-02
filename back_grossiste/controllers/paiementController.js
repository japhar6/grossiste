const Paiement = require("../models/Paiement");
const Commande = require("../models/Commandes");
const PaiementCommerciale = require("../models/PaimentCommerciale");
const { sendNotificationToAdmin } = require('../service/payementService'); // Service de notification


const mongoose = require("mongoose");
exports.validerpayement = async (req, res) => {
    try {
        const { id } = req.params; // ID de la commande (ou référence)
        const { idCaissier, referencePaiement, modePaiement, dateLimiteCredit } = req.body; 

        // Vérifier si l'ID est valide
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de commande invalide" });
        }

        // Trouver la commande par ID
        const commande = await Commande.findById(id);

        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Vérifier si la commande a une référence de facture
        if (!commande.referenceFacture) {
            return res.status(400).json({ message: "Référence de facture introuvable." });
        }

        // Vérifier si la référence de paiement est requise et fournie
        if ((modePaiement === "mobile money" || modePaiement === "virement bancaire") && !referencePaiement) {
            return res.status(400).json({ message: "La référence de paiement est requise pour ce mode de paiement." });
        }

        // Vérifier la date limite de crédit si paiement à crédit
        if (modePaiement === "a credit" && !dateLimiteCredit) {
            return res.status(400).json({ message: "La date limite de paiement à crédit est requise." });
        }

        // Déterminer le montant payé
        let montantPaye = modePaiement === "a credit" ? 0 : commande.totalGeneral;

        // Déterminer le statut du paiement
        let statutPaiement = modePaiement === "a credit" ? "non payé" : "payé complet";
      
     

            commande.statut = "payé";
            await commande.save();
     
        // Créer le paiement
        const paiement = new Paiement({
            commandeId: commande._id, 
            montantPaye: montantPaye, 
            totalPaiement: commande.totalGeneral,
            statut: statutPaiement,
            referenceFacture: commande.referenceFacture, 
            referencePaiement: referencePaiement || null, 
            idCaissier: idCaissier,
            modePaiement: modePaiement,
            dateLimiteCredit: modePaiement === "a credit" ? dateLimiteCredit : null,
            datePaiement: modePaiement === "a credit" ? null : new Date()
        });

        // Sauvegarder le paiement
        await paiement.save();

        // Associer le paiement à la commande
        commande.paiement = paiement._id;
        await commande.save();

        // Répondre avec les détails du paiement
        return res.status(200).json({
            message: "Paiement enregistré avec succès",
            paiement: {
                commandeId: paiement.commandeId,
                montantPaye: paiement.montantPaye,
                statut: paiement.statut,
                totalPaiement: paiement.totalPaiement,
                referencePaiement: paiement.referencePaiement,
                modePaiement: paiement.modePaiement,
                dateLimiteCredit: paiement.dateLimiteCredit
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
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
// Récupérer tous les paiements à crédit des clients et commerciaux
exports.getPaiementsCredittout = async (req, res) => {
    try {
        // Récupérer les paiements à crédit des clients
        const paiementsClientsCredit = await Paiement.find({ modePaiement: "a credit" }).populate({
            path: 'commandeId',
            populate: [
                { path: 'clientId', select: 'nom' },
                { path: 'commercialId', select: 'nom' }
            ]
        }).populate({
            path: 'idCaissier', select: 'nom'
        });

        // Récupérer les paiements à crédit des commerciaux
        const paiementsCommerciauxCredit = await PaiementCommerciale.find({ modePaiement: "crédit" })
            .populate({
                path: 'commandeId',
                populate: [
                    { path: 'clientId', select: 'nom' },
                    { path: 'commercialId', select: 'nom' }
                ]
            }).populate({
                path: 'idCaissier', select: 'nom'
            });

        // Combiner les résultats
        const paiementsCredit = {
            clients: paiementsClientsCredit.map(paiement => ({
                ...paiement.toObject(),
                clientNom: paiement.commandeId?.clientId?.nom || 'Inconnu',
                commercialNom: paiement.commandeId?.commercialId?.nom || 'Inconnu'
            })),
            commerciaux: paiementsCommerciauxCredit.map(paiement => ({
                ...paiement.toObject(),
                clientNom: paiement.commandeId?.clientId?.nom || 'Inconnu',
                commercialNom: paiement.commandeId?.commercialId?.nom || 'Inconnu'
            }))
        };

        res.status(200).json(paiementsCredit);
    } catch (error) {
        console.error("Erreur lors de la récupération des paiements à crédit:", error);
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
                modePaiement: paiement.modePaiement || 'Inconnu',
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


exports.getPaiementsCredit = async (req, res) => {
    try {
        // Récupérer les paiements dont le mode de paiement est "a credit"
        const paiements = await Paiement.find({ modePaiement: "a credit" })
            .populate({
                path: "commandeId",
                populate: [
                    { path: "produits.produit", model: "Produit" }, 
                    { path: "clientId", select: "nom" }, 
                    { path: "commercialId", select: "nom" }
                    
                ]
            })
            .exec();

        // Vérifier si aucun paiement à crédit n'est trouvé
        if (paiements.length === 0) {
            return res.status(404).json({ message: "Aucun paiement à crédit trouvé." });
        }

        // Répondre avec les paiements trouvés
        return res.status(200).json(paiements);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.mettreAJourPaiement = async (req, res) => {
    try {
        const { referenceFacture } = req.params; // Récupérer la référence de facture
        const { modePaiement, referencePaiement } = req.body; // Mode de paiement et référence si nécessaire

        // Trouver le paiement correspondant
        const paiement = await Paiement.findOne({ referenceFacture });

        if (!paiement) {
            return res.status(404).json({ message: "Paiement non trouvé pour cette référence de facture." });
        }

        // Vérifier que le paiement est bien en mode "a credit"
        if (paiement.modePaiement !== "a credit") {
            return res.status(400).json({ message: "Ce paiement n'est pas en mode crédit." });
        }

        // Vérifier que le paiement n'est pas déjà réglé
        if (paiement.statut === "payé complet") {
            return res.status(400).json({ message: "Ce paiement a déjà été entièrement réglé." });
        }

        // Vérifier si la référence de paiement est requise pour certains modes
        if ((modePaiement === "mobile money" || modePaiement === "virement bancaire") && !referencePaiement) {
            return res.status(400).json({ message: "La référence de paiement est requise pour ce mode de paiement." });
        }

        // Mettre à jour le paiement avec le montant total et le statut
        paiement.montantPaye = paiement.totalPaiement; // Montant payé = total
        paiement.statut = "payé complet";
        paiement.modePaiement = modePaiement;
        paiement.referencePaiement = referencePaiement || paiement.referencePaiement;
        paiement.datePaiement = new Date(); // Date de remboursement

        // Sauvegarder le paiement mis à jour
        await paiement.save();

       

        // Répondre avec les nouvelles informations du paiement
        return res.status(200).json({
            message: "Paiement à crédit remboursé avec succès",
            paiement: {
                referenceFacture: paiement.referenceFacture,
                montantPaye: paiement.montantPaye,
                statut: paiement.statut,
                totalPaiement: paiement.totalPaiement,
                modePaiement: paiement.modePaiement,
                referencePaiement: paiement.referencePaiement,
                datePaiement: paiement.datePaiement
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
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


