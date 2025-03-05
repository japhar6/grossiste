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
        let { commandeId, magasinierId } = req.body;

        // Récupérer la commande
        let commande = await Commande.findById(commandeId).populate('produits.produit');
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Vérifier si tous les produits ont un entrepotId défini
        for (let item of commande.produits) {
            if (!item.entrepotId) {
                return res.status(400).json({ message: `Entrepôt non défini pour le produit "${item.produit.nom}"` });
            }
        }

        // Créer une vente
        let vente = new Vente({
            commandeId,
            produits: [],
            magasinierId,
            statut: 'validée',
            dateValidationMagasinier: Date.now(),
        });

        // Réduction du stock et gestion de l'état des produits
        await Promise.all(commande.produits.map(async (item) => {
            let remainingQuantity = item.quantite;  // Quantité à traiter
            let produitId = item.produit._id;
            let produit = await Produit.findById(produitId);
            let entrepotId = item.entrepotId._id;  // L'entrepôt spécifique à chaque produit

            console.log(`Produit: ${item.produit.nom}, Quantité demandée: ${remainingQuantity}, Entrepôt: ${item.entrepotId.nom}`);

            let stocks = await Stock.find({ produit: produitId, entrepot: entrepotId }).sort({ dateEntree: 1 });

            if (stocks.length === 0) {
                console.log(`🚨 Le produit "${item.produit.nom}" est en rupture de stock dans l'entrepôt "${item.entrepotId.nom}".`);
                throw new Error(`🚨 Le produit "${item.produit.nom}" est en rupture de stock dans l'entrepôt "${item.entrepotId.nom}".`);
            }

         // Conversion de l'unité si nécessaire
let { quantite: quantityInMinUnit, unite } = convertirUnite(remainingQuantity, item.uniteChoisie, produit.unites);

// Affichage détaillé de la conversion
console.log(`Conversion de la quantité:`);
console.log(`${remainingQuantity} ${item.uniteChoisie} = ${quantityInMinUnit} ${unite}`);


            for (let i = 0; i < stocks.length; i++) {
                let stock = stocks[i];
                console.log(`Stock disponible: ${stock.quantite} (prix unitaire: ${stock.prixUnitaire})`);

                if (quantityInMinUnit <= 0) break;

                let availableQuantity = stock.quantite;

                // Soustraction de la quantité du stock
                if (availableQuantity >= quantityInMinUnit) {
                    stock.quantite -= quantityInMinUnit;
                    stock.valeurTotale = stock.quantite * stock.prixUnitaire;
                    await stock.save();
                    console.log(`Réduction du stock: Nouveau stock pour "${item.produit.nom}" est ${stock.quantite}`);
                    quantityInMinUnit = 0;  // Tout a été soustrait
                } else {
                    quantityInMinUnit -= availableQuantity;
                    stock.quantite = 0;
                    stock.valeurTotale = 0;
                    await stock.save();
                    console.log(`Réduction partielle du stock. Stock restant pour "${item.produit.nom}": ${stock.quantite}`);
                }
            }

            // Si après toute la soustraction il reste une quantité non soustraite
            if (quantityInMinUnit > 0) {
                console.log(`🚨 Stock insuffisant pour "${item.produit.nom}" dans l'entrepôt "${item.entrepotId.nom}".`);
                throw new Error(`🚨 Stock insuffisant pour "${item.produit.nom}" dans l'entrepôt "${item.entrepotId.nom}".`);
            }

            // Ajoute les informations de produit à la vente
            vente.produits.push({
                produit: item.produit._id,
                quantite: item.quantite,
                quantiteConvertie: quantityInMinUnit,  // Cette valeur doit maintenant être correcte
                unite: unite,
                entrepotId: item.entrepotId._id
            });

            console.log(`Produit "${item.produit.nom}" ajouté à la vente avec ${item.quantite} unité(s) de type "${unite}"`);
        }));

        await vente.save();
        console.log(`Vente validée avec succès. Vente ID: ${vente._id}`);

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
            // Vérifie si l'entrepôt est défini pour chaque produit
            if (!item.entrepotId) {
                throw new Error(`Entrepôt non défini pour le produit ${item.produit.nom}`);
            }

            let entrepotId = item.entrepotId._id; // Accède à l'ID de l'entrepôt uniquement s'il est défini
            console.log(`Produit: ${item.produit.nom}, Quantité demandée: ${remainingQuantity}, Entrepôt: ${item.entrepotId.nom}`);

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
