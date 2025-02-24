const Paiement = require("../models/Paiement");
const Commande = require("../models/Commandes");
const PaiementCommerciale = require("../models/PaimentCommerciale");

exports.validerpayement = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut, remiseGlobale, remiseParProduit, remiseFixe, idCaissier } = req.body; // Ajout de remiseFixe
  
        // Recherche de la commande par ID
        const commande = await Commande.findById(id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }
  
       // Calcul du montant après remise globale
let montantFinalPaye = commande.totalGeneral;
let montanApres = montantFinalPaye; // Valeur initiale

// Si remise globale est spécifiée et non égale à 0, l'appliquer
if (remiseGlobale && remiseGlobale > 0) {
    montanApres -= montanApres * (remiseGlobale / 100);
    console.log("Total après remise globale:", montanApres); 
}

// Calcul du montant après remise par produit
let produitsAvecRemises = [];
if ((!remiseGlobale || remiseGlobale === 0) && remiseParProduit && Array.isArray(remiseParProduit)) {
    // Appliquer remise par produit sans modifier la commande
    produitsAvecRemises = commande.produits.map(item => {
        const produitRemise = remiseParProduit.find(rp => rp.produitId.toString() === item.produit.toString());

        if (produitRemise) {
            const remiseProduit = produitRemise.remise || 0;
            const prixProduit = item.prixUnitaire;
            const prixApresRemise = prixProduit - (prixProduit * (remiseProduit / 100));
            const totalProduit = prixApresRemise * item.quantite;

            return {
                produitId: item.produit,
                remise: remiseProduit,
                prixAvantRemise: prixProduit,
                prixApresRemise: prixApresRemise,
                totalProduit: totalProduit
            };
        }

        return null; // Aucun changement si pas de remise appliquée
    }).filter(item => item !== null); // Supprimer les éléments null qui n'ont pas eu de remise

    // Calcul final du montant après remise par produit
    if (produitsAvecRemises.length > 0) {
        montanApres = produitsAvecRemises.reduce((acc, item) => acc + item.totalProduit, 0);
        console.log("Montant final après remise par produit :", montanApres);
    }
}

// Appliquer la remise fixe si elle est fournie
if (remiseFixe && remiseFixe > 0) {
    montanApres -= remiseFixe;
    console.log("Total après remise fixe:", montanApres);
}

// Si aucune remise n'est appliquée, utiliser le montant final sans modification
if (montanApres === montantFinalPaye) {
    montanApres = montantFinalPaye;
}
        // Mettre à jour le statut de la commande
        commande.statut = "payé";
        await commande.save();
  
        // Créer un paiement avec le montant correctement mis à jour
        const paiement = new Paiement({
            commandeId: commande._id,
            montantPaye: montanApres,  // Montant final après remise
        
            totalPaiement: montanApres,  // Le même montant ici aussi
            statut: "payé complet",
            remiseGlobale: remiseGlobale || 0,
            remiseParProduit: remiseParProduit || [],
            remiseFixe: remiseFixe || 0 ,
            idCaissier  
        });
  
        // Sauvegarder le paiement dans la base de données
        await paiement.save();
  
        return res.status(200).json({ message: "Paiement validé avec succès", paiement: {
            commandeId: paiement.commandeId,
            montantPaye: paiement.montantPaye,
            statut: paiement.statut,
            remiseGlobale: paiement.remiseGlobale,
            remiseParProduit: paiement.remiseParProduit,
            remiseFixe: paiement.remiseFixe,  
            totalPaiement: paiement.totalPaiement,
            produitsAvecRemises: produitsAvecRemises,
            montantFinal: montanApres
        } });
    } catch (error) {
        res.status(400).json({ message: error.message });
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
                    { path: 'modePaiement', select: 'modePaiement' } // Récupérer le mode de paiement
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
            })   ;

        // Combiner les deux résultats
        const paiements = {
            clients: paiementsClients.map(paiement => {
                const modePaiementClient = paiement.commandeId?.modePaiement || 'Inconnu';
                return {
                    ...paiement.toObject(),
                    clientNom: paiement.commandeId?.clientId?.nom || 'Inconnu',
                    produits: paiement.commandeId?.produits?.map(produit => ({
                        nom: produit.produit.nom,
                        prixUnitaire: produit.produit.prixUnitaire
                    })) || [],
                    modePaiement: modePaiementClient
                };
            }),
            commerciaux: paiementsCommerciaux.map(paiement => {
                const modePaiementCommercial = paiement.commandeId?.modePaiement || 'Inconnu';
                return {
                    ...paiement.toObject(),
                    commercialNom: paiement.commandeId?.commercialId?.nom || 'Inconnu',
                    produits: paiement.commandeId?.produits?.map(produit => ({
                        nom: produit.produit.nom,
                        prixUnitaire: produit.produit.prixUnitaire
                    })) || [],
                    modePaiement: modePaiementCommercial
                };
            })
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






