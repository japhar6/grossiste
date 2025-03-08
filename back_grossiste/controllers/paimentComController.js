const PaiementCommerciale = require("../models/PaimentCommerciale");
const Commande = require("../models/Commandes");
const VenteCom = require('../models/VenteComm'); // Assure-toi du bon chemin
const Produit = require("../models/Produits");
const mongoose = require('mongoose');
const FoncdCaisse = require('../models/FondCaisse');


exports.getPaiementsParMode = async (req, res) => {
    try {
      // Utilisation de Mongoose pour filtrer les paiements par modePaiement
      const paiements = await PaiementCommerciale.find({ modePaiement: 'a credit' });
      // Envoi de la réponse au client avec les paiements récupérés
      const suggestions = paiements.map(paiement => paiement.referenceFacture);
      res.status(200).json(suggestions);
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements par crédit :", error);
      res.status(500).json({ message: "Erreur lors de la récupération des paiements." });
    }
  };
  

exports.validerPaiementCommerciale = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut, idCaissier, dateLimiteCredit, modePaiement } = req.body;  // Définir "à crédit" par défaut

        // Recherche de la commande par ID
        const commande = await Commande.findById(id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Vérifier si c'est un commercial
        if (commande.typeClient !== "Commercial") {
            return res.status(400).json({ message: "Cette commande n'est pas destinée à un commercial" });
        }

        // Si le mode de paiement est "à crédit", vérifier que la date limite est fournie
        if (modePaiement === "a credit" && !dateLimiteCredit) {
            return res.status(400).json({ message: "La date limite de paiement à crédit est requise." });
        }

        // Le montant final à payer est simplement le total de la commande
        const montantFinalPaye = commande.totalGeneral;

        // Mettre à jour le statut de la commande
        commande.statut = "payé";
        await commande.save();

        // Créer un paiement à crédit pour le commercial
        const paiementCommerciale = new PaiementCommerciale({
            commandeId: commande._id,
            montantPaye: 0,  // Pas encore payé
            montantRestant: montantFinalPaye,  // Le montant restant à payer
            totalPaiement: montantFinalPaye,  // Le montant total à payer
            statut: "non payé", // Statut initial à "non payé"
            idCaissier, // ID du caissier
            referenceFacture: commande.referenceFacture, // Ajout de la référence de facture
            modePaiement: modePaiement,
            dateLimiteCredit: modePaiement === "a credit" ? dateLimiteCredit : null // Ajout de la date limite si le paiement est à crédit
            // Utiliser "à crédit" par défaut si non spécifié
        });


        // Sauvegarder le paiement
        await paiementCommerciale.save();

        commande.paiement = paiementCommerciale._id;
        await commande.save();

        return res.status(200).json({ message: "Paiement à crédit validé pour commercial", paiementCommerciale });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Fonction pour convertir la quantité d'une unité à une autre
const convertirQuantite = async (quantite, uniteVendu, produitId) => {
    try {
        // Trouver les détails du produit à partir de son ID
        const produitDetails = await Produit.findById(produitId);

        if (!produitDetails) {
            throw new Error(`Produit avec l'ID ${produitId} non trouvé.`);
        }

        // Trouver l'unité spécifique dans la liste des unités du produit
        const uniteDetails = produitDetails.unites.find(u => u.nom === uniteVendu);

        if (!uniteDetails) {
            throw new Error(`Unité ${uniteVendu} non trouvée pour le produit ${produitId}`);
        }

        // Récupérer le facteur de conversion de l'unité choisie vers l'unité de référence
        const facteurConversion = uniteDetails.conversion;

        // Calculer la quantité convertie dans l'unité de référence
        const quantiteConvertie = quantite * facteurConversion;

        // Retourner la quantité convertie
        return quantiteConvertie;

    } catch (error) {
        console.error(`Erreur de conversion : ${error.message}`);
        throw new Error("Erreur lors de la conversion des unités.");
    }
}

exports.mettreAJourPaiementCommerciale = async (req, res) => {
    try {
        const { referenceFacture } = req.params;
        const { produitsVendus ,modePaiement} = req.body;

        console.log(`Début de la mise à jour du paiement pour la facture ${referenceFacture}`);

        // Trouver le paiement commercial associé à la commande
        const paiementCommerciale = await PaiementCommerciale.findOne({ referenceFacture });
        if (!paiementCommerciale) {
            console.log(`Paiement commercial non trouvé pour la référence ${referenceFacture}`);
            return res.status(404).json({ message: `Paiement à crédit non trouvé pour cette référence.` });
        }
        console.log(`Paiement commercial trouvé : ${paiementCommerciale._id}`);

        // Trouver la commande associée à ce paiement
        const commande = await Commande.findById(paiementCommerciale.commandeId);
        if (!commande) {
            console.log(`Commande non trouvée pour le paiement ${paiementCommerciale._id}`);
            return res.status(404).json({ message: `Commande non trouvée.` });
        }
        console.log(`Commande trouvée : ${commande._id}`);

        // Vérifier que le statut du paiement est "non payé"
        if (paiementCommerciale.statut !== "non payé") {
            console.log(`Le paiement a déjà été effectué, statut actuel : ${paiementCommerciale.statut}`);
            return res.status(400).json({ message: `Le paiement doit être non payé pour pouvoir être mis à jour.` });
        }

        let montantTotalVendu = 0;
        console.log(`Calcul du montant total vendu...`);

        // Parcourir les produits vendus dans la commande
        for (const produit of produitsVendus) {
            console.log(`Traitement du produit ${produit.produitId}...`);

            // Trouver le produit dans la commande
            const produitCommande = commande.produits.find(item => item.produit.toString() === produit.produitId.toString());
            if (produitCommande) {
                console.log(`Produit trouvé dans la commande, unité : ${produitCommande.uniteChoisie}`);

                // Récupérer le produit et son unité vendue (Carton, Cartouche, etc.)
                const produitDetails = await Produit.findById(produitCommande.produit);
                const uniteVendu = produit.uniteVendu; // L'unité choisie lors du paiement

                // Trouver le prix de vente pour l'unité vendue
                const uniteDetails = produitDetails.unites.find(u => u.nom === uniteVendu);

                if (uniteDetails) {
                    const prixdevente = uniteDetails.prixdevente;
                    const quantite = produit.quantite;

                    // Vérification si prixUnitaire et quantite sont des nombres valides
                    if (typeof prixdevente !== 'number' || isNaN(prixdevente)) {
                        console.log(`Prix unitaire invalide pour le produit ${produit.produitId}`);
                        return res.status(400).json({ message: `Prix unitaire invalide pour le produit ${produit.produitId}.` });
                    }
                    if (typeof quantite !== 'number' || isNaN(quantite)) {
                        console.log(`Quantité invalide pour le produit ${produit.produitId}`);
                        return res.status(400).json({ message: `Quantité invalide pour le produit ${produit.produitId}.` });
                    }

                    // Calcul du montant du produit en fonction du prix de l'unité et de la quantité
                    const montantProduit = prixdevente * quantite;
                    if (isNaN(montantProduit)) {
                        console.log(`Montant calculé invalide pour le produit ${produit.produitId}`);
                        return res.status(400).json({ message: `Le montant calculé pour un produit est invalide pour le produit ${produit.produitId}.` });
                    }

                    montantTotalVendu += montantProduit;
                    console.log(`Montant du produit ${produit.produitId} ajouté au total : ${montantProduit}`);
                } else {
                    console.log(`Unité vendue ${uniteVendu} non trouvée pour le produit ${produit.produitId}`);
                    return res.status(404).json({ message: `Unité vendue ${uniteVendu} non trouvée pour le produit ${produit.produitId}.` });
                }
            } else {
                console.log(`Produit ${produit.produitId} non trouvé dans la commande.`);
                return res.status(404).json({ message: `Produit ${produit.produitId} non trouvé dans la commande.` });
            }
        }

        // Vérifier si montantTotalVendu est un nombre valide
        if (isNaN(montantTotalVendu)) {
            console.log(`Montant total vendu invalide.`);
            return res.status(400).json({ message: `Le montant total vendu est invalide.` });
        }

        console.log(`Montant total vendu : ${montantTotalVendu}`);

        // Mise à jour du paiement
        paiementCommerciale.montantPaye = isNaN(paiementCommerciale.montantPaye + montantTotalVendu) ? 0 : paiementCommerciale.montantPaye + montantTotalVendu;
        paiementCommerciale.montantRestant = paiementCommerciale.totalPaiement - paiementCommerciale.montantPaye;
paiementCommerciale.modePaiement=modePaiement;
        // Vérification du statut du paiement
        if (paiementCommerciale.montantRestant === 0) {
            paiementCommerciale.statut = "payé complet";
        } else {
            paiementCommerciale.statut = "payé partiel";
        }

        console.log(`Mise à jour du paiement : Montant payé : ${paiementCommerciale.montantPaye}, Montant restant : ${paiementCommerciale.montantRestant}, Statut : ${paiementCommerciale.statut}`);

        // Sauvegarder le paiement mis à jour
        await paiementCommerciale.save();
        console.log(`Paiement mis à jour avec succès.`);

        const convertirQuantite = async (quantite, uniteVendu, produitId, uniteReference) => {
            try {
                // Trouver les détails du produit à partir de son ID
                const produitDetails = await Produit.findById(produitId);

                if (!produitDetails) {
                    throw new Error(`Produit avec l'ID ${produitId} non trouvé.`);
                }

                // Trouver les détails de l'unité de vente et de l'unité de référence
                const uniteVenduDetails = produitDetails.unites.find(u => u.nom === uniteVendu);
                const uniteReferenceDetails = produitDetails.unites.find(u => u.nom === uniteReference);

                if (!uniteVenduDetails || !uniteReferenceDetails) {
                    throw new Error(`Les unités ${uniteVendu} ou ${uniteReference} ne sont pas trouvées.`);
                }

                // Récupérer les facteurs de conversion
                const facteurConversionUniteVendu = uniteVenduDetails.conversion;
                const facteurConversionUniteReference = uniteReferenceDetails.conversion;

                // Si les unités sont les mêmes, aucune conversion nécessaire
                if (uniteVendu === uniteReference) {
                    return quantite;
                }

                // Calcul de la conversion entre les unités
                let quantiteConvertie;

                // Si l'unité de vente est plus grande que l'unité de référence, on divise
                if (facteurConversionUniteVendu > facteurConversionUniteReference) {
                    quantiteConvertie = quantite * facteurConversionUniteVendu / facteurConversionUniteReference;
                }
                // Sinon on multiplie
                else {
                    quantiteConvertie = quantite * facteurConversionUniteReference / facteurConversionUniteVendu;
                }

                console.log(`Conversion de ${quantite} ${uniteVendu} en ${uniteReference} : ${quantiteConvertie}`);

                return quantiteConvertie;
            } catch (error) {
                console.error(`Erreur de conversion : ${error.message}`);
                throw new Error("Erreur lors de la conversion des unités.");
            }
        };



        const produitsRestants = await Promise.all(commande.produits.map(async (produitCommande) => {
            // Trouver le produit dans la commande
            const produitVendu = produitsVendus.find(p => p.produitId === produitCommande.produit.toString());

            if (produitVendu) {
                console.log(`Vérification des produits :`);

                // Afficher les détails de l'unité du produit vendu et de la commande
                console.log(`Unité dans la commande : ${produitCommande.uniteChoisie}`);
                console.log(`Unité dans le produit vendu : ${produitVendu.uniteVendu}`);

                // Afficher les quantités pour le produit vendu, dans la commande et la quantité restante
                console.log(`Quantité dans la commande : ${produitCommande.quantite}`);
                console.log(`Quantité vendue : ${produitVendu.quantite}`);

                // Comparer les unités
                if (produitCommande.uniteChoisie === produitVendu.uniteVendu) {
                    // Si les unités correspondent, calculer la quantité restante
                    const quantiteRestante = produitCommande.quantite - produitVendu.quantite;
                    console.log(`Quantité restante après vente : ${quantiteRestante}`);

                    if (quantiteRestante >= 0) {
                        return {
                            produitId: produitCommande.produit,
                            quantiteRestante: quantiteRestante,
                            unite: produitVendu.uniteVendu  // Utiliser l'unité vendue du produit
                        };
                    }
                } else {
                    // Si les unités ne correspondent pas, essayer la conversion
                    console.log(`Les unités ne correspondent pas. Tentative de conversion...`);

                    // Log des unités et des quantités avant la conversion
                    console.log(`Tentative de conversion entre unités : ${produitCommande.uniteChoisie} et ${produitVendu.uniteVendu}`);
                    console.log(`Quantité dans la commande : ${produitCommande.quantite}`);
                    console.log(`Quantité vendue : ${produitVendu.quantite}`);

                    // Effectuer la conversion des quantités
                    try {
                        // Convertir la quantité dans la commande et la quantité vendue
                        const quantiteCommandeConvertie = await convertirQuantite(produitCommande.quantite, produitCommande.uniteChoisie, produitCommande.produit, produitVendu.uniteVendu);
                        const quantiteVenduConvertie = await convertirQuantite(produitVendu.quantite, produitVendu.uniteVendu, produitVendu.produitId, produitVendu.uniteVendu);

                        console.log(`Quantité convertie dans la commande : ${quantiteCommandeConvertie}`);
                        console.log(`Quantité convertie dans le produit vendu : ${quantiteVenduConvertie}`);

                        // Calculer la quantité restante après conversion
                        const quantiteRestante = quantiteCommandeConvertie - quantiteVenduConvertie;
                        console.log(`Quantité restante après conversion : ${quantiteRestante}`);

                        if (quantiteRestante >= 0) {
                            return {
                                produitId: produitCommande.produit,
                                quantiteRestante: quantiteRestante,
                                unite: produitVendu.uniteVendu
                            };
                        } else {
                            console.log(`Quantité restante négative après conversion, produit non valide.`);
                        }
                    } catch (conversionError) {
                        console.log(`Erreur de conversion : ${conversionError.message}`);
                    }
                }
            } else {
                console.log(`Produit ${produitCommande.produit} non trouvé dans les produits vendus.`);
            }
            return null;  // Retourne null si la quantité restante est invalide ou si le produit n'a pas été trouvé
        }));


        // Filtrer les valeurs nulles si une quantité restante est invalide
        const produitsRestantsFiltres = produitsRestants.filter(Boolean);

        console.log(`Produits restants calculés avec succès :`, produitsRestantsFiltres);




        // Créer l'enregistrement VenteCom avec les produits vendus et produits restants
        const vente = new VenteCom({
            commercialId: commande.commercialId,
            commandeId: commande._id,
            produitsVendus: await Promise.all(produitsVendus.map(async produit => {
                const produitDB = await Produit.findById(produit.produitId);
                return {
                    produitId: produit.produitId,
                    quantite: produit.quantite,
                    unite: produit.uniteVendu  // Assurer que l'unité est également assignée pour les produits vendus
                };
            })),
            produitsRestants: produitsRestants,
            montantTotal: montantTotalVendu
        });

        // Sauvegarder l'enregistrement VenteCom
        await vente.save();
        console.log(`Enregistrement de la vente créé avec succès.`);

        const foncdCaisse = new FoncdCaisse({
            totalPaiement: paiementCommerciale.montantPaye,
            datePaiement: paiementCommerciale.updatedAt || new Date() // Utilisation de la date actuelle si datePaiement est null
        });
        // Sauvegarder l'entrée de FoncdCaisse
        await foncdCaisse.save();


        return res.status(200).json({
            message: `Paiement et vente mis à jour avec succès`,
            paiementCommerciale,
            vente
        });

    } catch (error) {
        console.error(`Erreur lors de la mise à jour du paiement : ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};






exports.getVentesByCommercial = async (req, res) => {
    try {
        const { commercialId } = req.params;

        const ventes = await VenteCom.find({ commercialId })
            .populate("produitsRestants.produitId", "nom")
            .populate("produitsVendus.produitId", "nom");
        ;
        if (!ventes || ventes.length === 0) {
            return res.status(404).json({ message: "Aucune vente trouvée pour ce commercial" });
        }

        res.status(200).json(ventes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVentesByInfo = async (req, res) => {
    try {
        const { commercialId, commandeId } = req.params;

        // Assurez-vous de filtrer par référence de facture (ou un autre critère unique)
        const ventes = await VenteCom.find({ commercialId, commandeId })
            .populate("produitsRestants.produitId", "nom")
            .populate("produitsVendus.produitId", "nom");

        if (!ventes || ventes.length === 0) {
            return res.status(404).json({ message: "Aucune vente trouvée pour ce commercial et cette commande" });
        }

        res.status(200).json(ventes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.getPaiementsCommerciales = async (req, res) => {
    try {
        const paiements = await PaiementCommerciale.find()
            .populate("commandeId", "referenceFacture modePaiement statut date commercialId")
            .populate({
                path: "commandeId",
                populate: {
                    path: "commercialId",
                    select: "_id nom prenom" // Ajout de l'ID du commercial
                }
            })
            .populate("idCaissier", "nom");

        const paiementsFormatted = paiements.map(paiement => ({
            commande: paiement.commandeId?._id || "N/A",
            referenceFacture: paiement.commandeId?.referenceFacture || "N/A",
            caissier: paiement.idCaissier ? `${paiement.idCaissier.nom}` : "Inconnu",
            modePaiement: paiement.commandeId?.modePaiement || "Non défini",
            commercial: paiement.commandeId?.commercialId?._id || "N/A", // Ajout de l'ID du commercial
            commercialNom: paiement.commandeId?.commercialId ? `${paiement.commandeId.commercialId.nom} ` : "N/A",
            statut: paiement.statut,
            date: paiement.createdAt.toISOString().split('T')[0]
        }));

        res.status(200).json(paiementsFormatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getPaiementsCommercialespaye = async (req, res) => {
    try {
        const paiements = await PaiementCommerciale.find()
            .populate("commandeId", "referenceFacture modePaiement statut date commercialId")
            .populate({
                path: "commandeId",
                populate: {
                    path: "commercialId",
                    select: "_id nom prenom" // Ajout de l'ID du commercial
                }
            })
            .populate("idCaissier", "nom");

        // Filtrer les paiements pour exclure ceux dont le statut est "non payé"
        const paiementsPayes = paiements.filter(paiement => paiement.statut !== "non payé");

        const paiementsFormatted = paiementsPayes.map(paiement => ({
            commande: paiement.commandeId?._id || "N/A",
            referenceFacture: paiement.commandeId?.referenceFacture || "N/A",
            caissier: paiement.idCaissier ? `${paiement.idCaissier.nom}` : "Inconnu",
            modePaiement: paiement.commandeId?.modePaiement || "Non défini",
            commercial: paiement.commandeId?.commercialId?._id || "N/A", // Ajout de l'ID du commercial
            commercialNom: paiement.commandeId?.commercialId ? `${paiement.commandeId.commercialId.nom} ` : "N/A",
            statut: paiement.statut,
            date: paiement.createdAt.toISOString().split('T')[0]
        }));

        res.status(200).json(paiementsFormatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
