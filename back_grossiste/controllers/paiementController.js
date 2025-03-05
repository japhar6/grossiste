const Paiement = require("../models/Paiement");
const Commande = require("../models/Commandes");
const PaiementCommerciale = require("../models/PaimentCommerciale");
const { sendNotificationToAdmin } = require('../service/payementService');


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
        const paiementsClients = await Paiement.find()
        .populate({
          path: 'commandeId',
          populate: [
            { path: 'clientId', select: 'nom adresse' },
            { path: 'commercialId', select: 'nom adresse' },
            {
                path: 'produits.produit',  // On peuple le champ "produit" dans le tableau "produits"
                select: 'nom'              // On sélectionne uniquement le champ "nom"
              },
          ]
        })
        .populate({
          path: 'idCaissier',
          select: 'nom'
        });
      

        // Récupérer les paiements commerciaux
        const paiementsCommerciaux = await PaiementCommerciale.find()
            .populate({
                path: 'commandeId',
                populate: [
                    { path: 'clientId', select: 'nom adresse'  },
                    { path: 'commercialId', select: 'nom adresse'  },  {
                        path: 'produits.produit',  // On peuple le champ "produit" dans le tableau "produits"
                        select: 'nom'              // On sélectionne uniquement le champ "nom"
                      },
                ]
            }).populate({
                path: 'idCaissier', select: 'nom'
            });

        // Combiner les deux résultats
        const paiements = {
            clients: paiementsClients.map(paiement => ({
                ...paiement.toObject(),
                clientNom: paiement.commandeId?.clientId?.nom || 'Inconnu', 
                clientAdresse: paiement.commandeId?.clientId?.adresse || 'Inconnu',
                ComAdresse: paiement.commandeId?.commercialId?.adresse || 'Inconnu',
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
                    nom: produit.produit?.nom || 'Produit inconnu',
                    prixUnitaire: produit.produit?.prixUnitaire || 0
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
                    nom: produit.produit?.nom || 'Produit inconnu',
                    prixUnitaire: produit.produit?.prixUnitaire || 0
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
                // Pas besoin de filtre par date, on prend tout
                const tousPaiements = await Paiement.find({ modePaiement: { $ne: 'a credit' } });
                const totalGlobalPaiements = tousPaiements.reduce((acc, paiement) => acc + paiement.totalPaiement, 0);

                const tousPaiementsCommerciale = await PaiementCommerciale.find({ statut: { $ne: 'non payé' } });
                const totalGlobalPaiementsCommerciale = tousPaiementsCommerciale.reduce((acc, paiementCommercial) => acc + paiementCommercial.montantPaye, 0);

                // Calculer le nombre de clients et commerciaux uniques
                const clients = new Set(tousPaiements.map(p => p.commandeId.toString())); // Paiements classiques
                const commerciaux = new Set(tousPaiementsCommerciale.map(p => p.idCaissier.toString())); // Paiements commerciaux

                return res.status(200).json({
                    periode: 'global',
                    totalPaiements: totalGlobalPaiements,
                    totalPaiementsCommercial: totalGlobalPaiementsCommerciale,
                    nombrePaiements: tousPaiements.length,
                    nombrePaiementsCommercial: tousPaiementsCommerciale.length,
                    nombreClients: clients.size,
                    nombreCommerciaux: commerciaux.size
                });

            default:
                return res.status(400).json({ message: 'Période non valide' });
        }

        // Si la période est différente de "global", on filtre par date et exclut les paiements "a credit"
        const paiements = await Paiement.find({
            createdAt: {
                $gte: dateDebut,
                $lte: dateFin
            },
            modePaiement: { $ne: 'a credit' }
        });

        const totalPaiements = paiements.reduce((acc, paiement) => acc + paiement.totalPaiement, 0);

        // Paiements commerciaux, excluant ceux dont le statut est "non payé"
        const paiementsCommerciale = await PaiementCommerciale.find({
            createdAt: {
                $gte: dateDebut,
                $lte: dateFin
            },
            statut: { $ne: 'non payé' }
        });

        const totalPaiementsCommerciale = paiementsCommerciale.reduce((acc, paiementCommercial) => acc + paiementCommercial.montantPaye, 0);

        // Calculer le nombre de clients et commerciaux uniques
        const clients = new Set(paiements.map(p => p.commandeId.toString())); // Paiements classiques
        const commerciaux = new Set(paiementsCommerciale.map(p => p.idCaissier.toString())); // Paiements commerciaux

        res.status(200).json({
            periode,
            totalPaiements: totalPaiements,
            totalPaiementsCommercial: totalPaiementsCommerciale,
            nombrePaiements: paiements.length,
            nombrePaiementsCommercial: paiementsCommerciale.length,
            nombreClients: clients.size,
            nombreCommerciaux: commerciaux.size
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getProduitsLesPlusVendus = async (req, res) => {
    try {
        // Récupérer les paiements clients
        const paiementsClients = await Paiement.find().populate({
            path: 'commandeId',
            populate: { path: 'produits.produit', select: 'nom' } // Correction ici
        });

        // Récupérer les paiements commerciaux
        const paiementsCommerciaux = await PaiementCommerciale.find().populate({
            path: 'commandeId',
            populate: { path: 'produits.produit', select: 'nom' } // Correction ici aussi
        });

        // Fusionner les produits des deux types de paiements
        const tousLesProduits = [
            ...paiementsClients.flatMap(p => p.commandeId?.produits || []),
            ...paiementsCommerciaux.flatMap(p => p.commandeId?.produits || []),
        ];

        // Filtrer uniquement les produits vendus
        const produitsVendusCommerciaux = tousLesProduits.filter(p => p.quantite > 0);

        // Regrouper par produit et compter les quantités vendues
        const produitsVendus = produitsVendusCommerciaux.reduce((acc, produit) => {
            const produitInfo = produit.produit; // Récupération du produit
        
            if (!produitInfo || !produitInfo._id) { // Vérifier que le produit existe
                return acc; // Ignorer si produitInfo est null ou s'il manque un _id
            }
        
            if (!acc[produitInfo._id]) {
                acc[produitInfo._id] = {
                    nom: produitInfo.nom,
                    totalVendu: 0
                };
            }
            acc[produitInfo._id].totalVendu += produit.quantite;
            return acc;
        }, {});
        
        // Transformer en tableau et trier par nombre de ventes
        const produitsTries = Object.values(produitsVendus).sort((a, b) => b.totalVendu - a.totalVendu);

        // Récupérer les 5 produits les plus vendus
        const produitsLesPlusVendus = produitsTries.slice(0, 5);

        // Récupérer les autres produits (tout ce qui n'est pas dans les 5 premiers)
        const autresProduits = produitsTries.slice(5).map(produit => ({
            nom: produit.nom,
            totalVendu: produit.totalVendu
        }));

        // Ajouter les autres produits dans la réponse
        res.status(200).json({
            produitsLesPlusVendus,
            autresProduits
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des produits les plus vendus:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};







