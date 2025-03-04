const Vente = require('../models/Ventes');
const Commande = require('../models/Commandes');
const Stock = require('../models/Stock');
const Entrepot = require('../models/Entrepot');
const Produit = require("../models/Produits");
const VenteCom = require('../models/VenteComm');
const PaiementCommerciale = require("../models/PaimentCommerciale");
// Controller pour l'historique des sorties
const User = require('../models/User');  // Assurez-vous de bien inclure votre modèle User
// Fonction de conversion d'unité
function convertirUnite(quantite, uniteAchat, unitesDisponibles) {
    // Trouver l'unité de départ
    let uniteSource = unitesDisponibles.find(u => u.nom === uniteAchat);

    if (!uniteSource) {
        console.error("❌ Erreur: Unité source introuvable !");
        return { quantite, unite: uniteAchat }; // Retourner la quantité d'origine si l'unité source n'est pas trouvée
    }

    // Trier les unités par ordre croissant de conversion (plus petite unité a une conversion plus grande)
    let unitesTriees = [...unitesDisponibles].sort((a, b) => b.conversion - a.conversion);

    // Trouver la plus petite unité
    let uniteCible = unitesTriees[0]; // La première unité dans la liste triée est la plus petite

    // Conversion
    let nouvelleQuantite = quantite * (uniteCible.conversion / uniteSource.conversion);
    return { quantite: nouvelleQuantite, unite: uniteCible.nom };
}
exports.validerVente = async (req, res) => {
    try {
        let { commandeId, magasinierId, entrepotId } = req.body;

        if (!entrepotId) {
            return res.status(400).json({ message: "Veuillez sélectionner un entrepôt." });
        }

        // Vérifier si l'entrepôt existe bien et appartient au magasinier
        let entrepot = await Entrepot.findOne({ _id: entrepotId, magasinier: magasinierId });
        if (!entrepot) {
            return res.status(403).json({ message: "Cet entrepôt ne vous appartient pas ou n'existe pas." });
        }

        // Récupérer la commande
        let commande = await Commande.findById(commandeId).populate('produits.produit');
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        if (commande.statut !== 'payé') {
            return res.status(400).json({ message: "La commande doit être validée par le caissier avant." });
        }

        // Créer une vente
        let vente = new Vente({
            commandeId,
            produits: [],
            magasinierId,
            entrepotId,  // Sauvegarder l'entrepôt utilisé
            statut: 'validée',
            dateValidationMagasinier: Date.now(),
        });

         // Vérifier si tous les produits sont en stock avant de commencer la réduction de stock
         let stockInsuffisant = false;
         for (let item of commande.produits) {
             let produitId = item.produit._id;
             let stocks = await Stock.find({ produit: produitId, entrepot: entrepotId }).sort({ dateEntree: 1 });
 
             if (stocks.length === 0) {
                 stockInsuffisant = true;
                 break;
             }
         }
 
         // Si un produit est en rupture de stock, retourner l'erreur sans effectuer la réduction de stock
         if (stockInsuffisant) {
             return res.status(400).json({
                 message: `🚨 Un ou plusieurs produits sont en rupture de stock dans l'entrepôt "${entrepot.nom}". Veuillez vérifier et réessayer.`
             });
         }

        // Réduction du stock
        await Promise.all(commande.produits.map(async (item) => {
            let remainingQuantity = item.quantite;
            let produitId = item.produit._id;
            let produit = await Produit.findById(produitId);

            let stocks = await Stock.find({ produit: produitId, entrepot: entrepotId }).sort({ dateEntree: 1 });

            if (stocks.length === 0) {
                throw new Error(`🚨 Le produit "${item.produit.nom}" est en rupture de stock dans l'entrepôt "${entrepot.nom}". Veuillez effectuer un transfert depuis un autre entrepôt ou effectuer un achat.`);
            }

            let { quantite: quantityInMinUnit, unite } = convertirUnite(remainingQuantity, item.uniteChoisie, produit.unites);

            for (let i = 0; i < stocks.length; i++) {
                let stock = stocks[i];
                if (quantityInMinUnit <= 0) break;

                let availableQuantity = stock.quantite;

                if (availableQuantity >= quantityInMinUnit) {
                    stock.quantite -= quantityInMinUnit;
                    stock.valeurTotale = stock.quantite * stock.prixUnitaire;
                    await stock.save();
                    quantityInMinUnit = 0;
                } else {
                    quantityInMinUnit -= availableQuantity;
                    stock.quantite = 0;
                    stock.valeurTotale = 0;
                    await stock.save();
                }
            }

            if (quantityInMinUnit > 0) {
                throw new Error(`🚨 Stock insuffisant pour "${item.produit.nom}" dans l'entrepôt "${entrepot.nom}".`);
            }

            vente.produits.push({
                produit: item.produit._id,
                quantite: item.quantite,
                quantiteConvertie: quantityInMinUnit,
                unite: unite
            });
        }));

        await vente.save();
        commande.statut = 'payé et livré';
        commande.modeLivraison = 'magasin';
        commande.dateSortie = Date.now(); 
        await commande.save();

        res.status(200).json({
            message: "✅ Vente validée avec succès et commande marquée comme livrée",
            vente,
            produits: vente.produits.map(item => ({
                produit: item.produit.nom,
                quantiteConvertie: item.quantiteConvertie,
                unite: item.unite
            })),
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};




exports.validerRetourProduits = async (req, res) => {
    try {
        const { venteComId, magasinierId } = req.body;

        // Vérifier si la vente existe
        const venteCom = await VenteCom.findById(venteComId).populate('produitsRestants.produitId');
        if (!venteCom) {
            return res.status(404).json({ message: "Vente non trouvée" });
        }

        // Vérifier si des produits restants existent
        if (!venteCom.produitsRestants || venteCom.produitsRestants.length === 0) {
            return res.status(400).json({ message: "Aucun produit restant à retourner" });
        }

        // Mettre à jour le stock
        await Promise.all(venteCom.produitsRestants.map(async (item) => {
            const stock = await Stock.findOne({ produit: item.produitId._id, statut: 'actif' });

            if (!stock) {
                throw new Error(`Stock introuvable pour le produit : ${item.produitId.nom}`);
            }

            // Affichage des détails de l'unité de retour et de l'unité du stock
            console.log(`Produit retourné : ${item.produitId.nom}`);
            console.log(`Unité de retour : ${item.unite}`);
            console.log(`Unité de stock : ${stock.unite}`);
            console.log(`Quantité retournée : ${item.quantiteRestante}`);

            // Vérifier si l'unité du produit retourné correspond à l'unité du stock
            if (item.unite !== stock.unite) {
                // Convertir la quantité retournée dans l'unité du stock
                console.log(`Les unités sont différentes, conversion nécessaire.`);
                item.quantiteRestante = await convertirQuantite(item.quantiteRestante, item.unite, item.produitId._id, stock.unite);
                console.log(`Quantité après conversion : ${item.quantiteRestante}`);
            }

            // Ajouter la quantité retournée au stock
            stock.quantite += item.quantiteRestante;
            stock.valeurTotale = stock.quantite * stock.prixUnitaire;

            console.log(`Quantité totale mise à jour dans le stock : ${stock.quantite}`);
            console.log(`Valeur totale mise à jour du stock : ${stock.valeurTotale}`);

            await stock.save();
        }));

        // Mettre à jour l'état de la vente
        venteCom.magasinierId = magasinierId;
        venteCom.dateValidationMagasinier = Date.now();

        await venteCom.save();

        // Trouver le paiement lié à cette vente (commande)
        const paiementCom = await PaiementCommerciale.findOne({ commandeId: venteCom.commandeId });
        if (!paiementCom) {
            return res.status(404).json({ message: "Paiement non trouvé pour cette commande" });
        }

        // Vérifier si tous les produits de la vente ont été retournés
        const tousLesProduitsRetournés = venteCom.produitsRestants.every(item => item.quantiteRestante > 0);

        if (tousLesProduitsRetournés) {
            paiementCom.statut = "Produits retourner";
        }

        await paiementCom.save();

        res.status(200).json({
            message: "Retour validé, stock mis à jour et statut de paiement mis à jour",
            venteCom,
            paiementCom
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getAllVentes = async (req, res) => {
    try {
        // Récupérer toutes les ventes, incluant les produits et le magasinier
        const ventes = await Vente.find()
            .populate("magasinierId", "nom")  
            .populate("entrepotId", "nom")// Limiter à la propriété 'nom' du magasinier
            .populate({
                path: "commandeId",              // Peupler la référence 'commandeId'
                populate: [
                    { path: "clientId", select: "nom email" },  // Peupler 'clientId' avec nom et email du client
                    { path: "commercialId", select: "nom" },    // Peupler 'commercialId' avec nom du commercial
                    { path: "vendeurId", select: "nom" },       // Peupler 'vendeurId' avec nom du vendeur
                    { path: "paiement", select: "type montant" }, // Peupler 'paiement' avec type et montant
                    { path: "produits.produit", select: "nom prix" } // Peupler 'produit' dans 'produits' avec nom et prix
                ]
            });
        
        if (ventes.length === 0) {
            return res.status(404).json({ message: 'Aucune vente trouvée' });
        }

        // Retourner les ventes
        res.status(200).json(ventes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// La fonction de conversion avec des logs pour suivre le processus
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

        // Affichage des unités et des facteurs de conversion
        console.log(`Unité de vente : ${uniteVendu}`);
        console.log(`Unité de référence : ${uniteReference}`);
        console.log(`Facteur de conversion pour ${uniteVendu}: ${facteurConversionUniteVendu}`);
        console.log(`Facteur de conversion pour ${uniteReference}: ${facteurConversionUniteReference}`);

        // Si les unités sont les mêmes, aucune conversion nécessaire
        if (uniteVendu === uniteReference) {
            console.log(`Les unités sont identiques, aucune conversion nécessaire.`);
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
