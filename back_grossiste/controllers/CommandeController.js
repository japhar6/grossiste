const Commande = require("../models/Commandes");
const Produit = require("../models/Produits");
const Client = require("../models/Client");
const Commercial = require("../models/Commercial");
const Entrepot = require("../models/Entrepot");
const Stock = require('../models/Stock');
const Vente = require('../models/Ventes');
const PaiementCommerciale = require("../models/PaimentCommerciale");
const Paiement = require("../models/Paiement");
const pusher = require('../config/pusher');  

exports.ajouterCommande = async (req, res) => {
    try {
        const { typeClient, clientId, commercialId, vendeurId, produits, statut, entrepotId } = req.body;

        // Vérification du typeClient
        if (!typeClient || !["Client", "Commercial"].includes(typeClient)) {
            return res.status(400).json({ message: "typeClient doit être 'Client' ou 'Commercial'." });
        }

        // Recherche du client ou commercial selon le typeClient
        let clientOuCommercial;
        if (typeClient === "Client") {
            if (!clientId) return res.status(400).json({ message: "clientId est requis pour un Client." });
            clientOuCommercial = await Client.findById(clientId);
        } else {
            if (!commercialId) return res.status(400).json({ message: "commercialId est requis pour un Commercial." });
            clientOuCommercial = await Commercial.findById(commercialId);
        }




        if (!clientOuCommercial) {
            return res.status(404).json({ message: `${typeClient} non trouvé avec cet ID.` });
        }

        // Itérer sur les produits dans la commande pour récupérer leurs détails
        const produitsDetails = await Promise.all(produits.map(async (produitData) => {
            const produit = await Produit.findById(produitData.produit);
            if (!produit) {
                console.error(`Produit introuvable avec l'ID ${produitData.produit}`);
                throw new Error(`Produit introuvable avec l'ID ${produitData.produit}`);
            }
        
            const uniteChoisie = produit.unites.find(u => u.nom === produitData.uniteChoisie);
            if (!uniteChoisie) {
                console.error(`Unité introuvable pour le produit ${produit.nom}`);
                throw new Error(`Unité introuvable pour le produit ${produit.nom}`);
            }
        
            const prixdevente = uniteChoisie.prixdevente;
            const totalProduit = prixdevente * produitData.quantite;
        
        
            // Retourner les détails de chaque produit avec le champ entrepotId
            return {
                produit: produit._id,
                quantite: produitData.quantite,
                prixdevente,
                total: totalProduit,
               
                entrepotId: produitData.entrepotId || entrepotId,  // Assurez-vous de prendre l'entrepotId spécifique pour chaque produit
                uniteChoisie: uniteChoisie.nom
            };
        }));
        
        
        // Calcul du total général des produits après la remise par produit et remise fixe
        let totalGeneral = produitsDetails.reduce((acc, produit) => acc + produit.total, 0);
        
        // Création de la commande avec le montant après remise appliqué
        const nouvelleCommande = new Commande({
            typeClient,
            clientId: typeClient === "Client" ? clientId : null,
            commercialId: typeClient === "Commercial" ? commercialId : null,
            vendeurId,
          
            produits: produitsDetails,
            totalGeneral,  // Ce total général inclut désormais la remise fixe
            statut
        });
        
        await nouvelleCommande.save();

        console.log("Commande créée avec succès :", nouvelleCommande);


      // Émettre un événement Pusher avec juste l'ID de la commande
 pusher.trigger('caissier-channel', 'nouveau-comande', {
    message: 'Nouvelle commande reçue.',
   
  });
        
        res.status(201).json({
            message: "Commande créée avec succès.",
            commande: nouvelleCommande
        });        

    } catch (error) {
        console.error("Erreur lors de l'ajout de la commande :", error);
        res.status(400).json({ message: error.message });
    }
};

// Récupérer toutes les commandes
exports.getCommandes = async (req, res) => {
    try {
        const commandes = await Commande.find().populate('produits.produit', 'nom *')
        .populate('vendeurId', 'nom')
        .populate('clientId','nom')
        .populate('commercialId', 'nom');
        res.status(200).json(commandes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.countCommande = async (req, res) => {
  try {
    const count = await Commande.countDocuments();
    res.status(200).json({ totalcommande: count });
  } catch (error) {
res.status(500).json({ message: "❌ Erreur lors du comptage des commandes", error: error.message });

  }
};
// Récupérer une commande par son ID
exports.getCommandeById = async (req, res) => {
    try {
        const commande = await Commande.findById(req.params.id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }
        res.status(200).json(commande);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Récupérer une commande par sou référence et statu en cours
exports.getSuggestions = async (req, res) => {
    try {
        // Rechercher toutes les commandes avec le statut "en cours"
        const commandes = await Commande.find({ statut: "en cours" }).sort({ createdAt: -1 }); // Tri par date décroissante

        // Renvoie les références des commandes
        const suggestions = commandes.map(commande => commande.referenceFacture);
        res.status(200).json(suggestions);
    } catch (error) {
        console.error("Erreur lors de la récupération des suggestions :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des suggestions." });
    }
};
exports.getSuggestionstous = async (req, res) => {
    try {
        // Rechercher toutes les commandes sans filtre de statut
        const commandes = await Commande.find().sort({ createdAt: -1 }); // Tri par date décroissante

        // Vérifie si des commandes sont trouvées
        if (commandes.length === 0) {
            return res.status(404).json({ message: "Aucune commande trouvée." });
        }

        // Renvoie les références des commandes
        const suggestions = commandes.map(commande => commande.referenceFacture);
        res.status(200).json(suggestions);
    } catch (error) {
        console.error("Erreur lors de la récupération des suggestions :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des suggestions." });
    }
};

exports.getSuggestionscom = async (req, res) => {
    try {
        // Rechercher toutes les commandes avec le statut "payé" et le type de client "Commercial"
        const commandes = await Commande.find({
            statut: "en cours",
            typeClient: "Commercial",
            // Ajout de ":" pour spécifier la clé et sa valeur
        }).sort({ createdAt: -1 }); // Tri par date décroissante

        // Renvoie les références des commandes
        const suggestions = commandes.map(commande => commande.referenceFacture);
        res.status(200).json(suggestions);
    } catch (error) {
        console.error("Erreur lors de la récupération des suggestions :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des suggestions." });
    }
};

exports.getSuggestionscomcre = async (req, res) => {
    try {
        // Rechercher toutes les commandes avec le statut "payé" et le type de client "Commercial"
        const commandes = await Commande.find({
            statut: "payé",
            typeClient: "Commercial",
            // Ajout de ":" pour spécifier la clé et sa valeur
        }).sort({ createdAt: -1 }); // Tri par date décroissante

        // Renvoie les références des commandes
        const suggestions = commandes.map(commande => commande.referenceFacture);
        res.status(200).json(suggestions);
    } catch (error) {
        console.error("Erreur lors de la récupération des suggestions :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des suggestions." });
    }
};


// Récupérer une commande par sou référence
exports.getCommandeByref = async (req, res) => {
    try {
        const { referenceFacture } = req.params;
        let commande;

        if (referenceFacture) {
            commande = await Commande.findOne({ referenceFacture })
                .populate("clientId", "nom telephone creerPar")
                .populate("commercialId", "nom telephone")
                .populate("produits.produit", "nom")
                .populate("produits.entrepotId", "nom")
                .populate("paiement", "modePaiement") // Ajout de modePaiement
              
                ;
        } else {
            commande = await Commande.findById(req.params.id)
                .populate("clientId", "nom telephone")
                .populate("commercialId", "nom telephone")
                .populate("produits.produit", "nom")
                .populate("paiement", "modePaiement"); // Ajout de modePaiement

        }

        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        console.log(commande); // Vérifie la structure des produits ici

        res.status(200).json(commande);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer les commandes avec les statuts "terminée" et "livrée"
exports.getCommandesTermineesEtLivrees = async (req, res) => {
    try {
        // Filtrer les commandes par les statuts "terminée" et "livrée"
        const commandes = await Commande.find({
            statut: { $in: ["payé", "payé et livré"] }
        })
        .populate("produits.produit", "nom unite.nom")  // Récupérer les produits associés (nom du produit)
        .populate("clientId", "nom telephone")  // Récupérer les informations du client
        .populate("commercialId", "nom telephone")
        .populate("vendeurId", "nom")  // Récupérer les informations du vendeur
        .populate("paiement", "modePaiement")



        res.status(200).json(commandes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer les commandes avec les statuts "terminée" et "livrée"
exports.getCommandesLivrees = async (req, res) => {
    try {
        // Filtrer les commandes par les statuts "terminée" et "livrée"
        const commandes = await Commande.find({
            statut: { $in: [ "payé et livré"] }
        })
        .populate("produits.produit", "nom unite.nom")  // Récupérer les produits associés (nom du produit)
        .populate("clientId", "nom telephone")  // Récupérer les informations du client
        .populate("commercialId", "nom telephone")
        .populate("vendeurId", "nom")  // Récupérer les informations du vendeur
        .populate("paiement", "modePaiement")



        res.status(200).json(commandes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour une commande
exports.updateCommande = async (req, res) => {
    try {
        const commande = await Commande.findById(req.params.id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        const { produits } = req.body;
        let totalGeneral = 0;
        const produitsAvecTotal = produits.map(item => {
            const totalProduit = item.prixUnitaire * item.quantite;
            totalGeneral += totalProduit;
            return {
                ...item,
                total: totalProduit
            };
        });

        commande.produits = produitsAvecTotal;
        commande.totalGeneral = totalGeneral;

        await commande.save();
        res.status(200).json({ message: "Commande mise à jour avec succès", commande });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer une commande
exports.deleteCommande = async (req, res) => {
    try {
        const commande = await Commande.findByIdAndDelete(req.params.id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }
        res.status(200).json({ message: "Commande supprimée avec succès" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getCommandesByVendeur = async (req, res) => {
    try {
        const { vendeurId } = req.params;

        // Rechercher les commandes par ID de vendeur
        const commandes = await Commande.find({ vendeurId }).populate('produits.produit', 'nom prixDachat') .populate('clientId','nom')
        .populate('commercialId', 'nom'); // Ajustez les champs si nécessaire

        if (!commandes || commandes.length === 0) {
            return res.status(404).json({ message: "Aucune commande trouvée pour ce vendeur" });
        }

        res.status(200).json(commandes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sortieFournisseur = async (req, res) => {
    try {
        const { commandeId } = req.params;  // L'ID de la commande à modifier
        const { modeLivraison, statut } = req.body;  // Les nouvelles valeurs

        // Vérifier si le modeLivraison et le statut sont valides
        if (modeLivraison && !["magasin", "fournisseur"].includes(modeLivraison)) {
            return res.status(400).json({ message: "Le modeLivraison doit être 'magasin' ou 'fournisseur'." });
        }
        if (statut && !["en cours", "payé", "payé et livré"].includes(statut)) {
            return res.status(400).json({ message: "Le statut doit être 'en cours', 'payé' ou 'payé et livré'." });
        }

        // Trouver la commande par son ID
        const commande = await Commande.findById(commandeId);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée." });
        }

        // Mettre à jour le modeLivraison et statut de la commande
        if (modeLivraison) {
            commande.modeLivraison = modeLivraison;
        }
        if (statut) {
            commande.statut = statut;
        }

        // Sauvegarder les changements dans la base de données
        await commande.save();

        // Répondre avec la commande mise à jour
        res.status(200).json({
            message: "Commande modifiée avec succès.",
            commande: commande
        });
    } catch (error) {
        console.error("Erreur lors de la modification de la commande :", error);
        res.status(400).json({ message: error.message });
    }
};



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

exports.annulerVenteParReference = async (req, res) => {
    try {
        let { referenceFacture } = req.params;

        // Récupérer la commande à partir de la référence de facture
        let commande = await Commande.findOne({ referenceFacture }).populate('produits.produit');
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Vérifier si la commande est annulée
        if (commande.statut === 'annulée') {
            return res.status(400).json({ message: "Cette commande a déjà été annulée" });
        }

        // Vérifier si la commande est annulée
        if (commande.statut === 'en cours') {
            return res.status(400).json({ message: "Cette commande n'a pas encore été payée" });
        }

       // Trouver la vente associée à cette commande
       let vente = await Vente.findOne({ commandeId: commande._id }).populate('produits.produit');

       // Si la vente n'existe pas (elle a peut-être été supprimée après l'annulation)
       if (!vente) {
             // Vérifier si la commande est annulée
        if (commande.statut === 'annulée') {
            return res.status(400).json({ message: "Cette commande a déjà été annulée" });
        }

        // Vérifier si la commande est annulée
        if (commande.statut === 'en cours') {
            return res.status(400).json({ message: "Cette commande n'a pas encore été payée" });
        }



           // Sinon, indiquer qu'il n'y a pas de vente à annuler
           return res.status(404).json({ message: "Aucune vente associée à cette commande" });
       }

        // Vérifier le statut de la commande
        if (commande.statut === 'payé' ) {
            // Annuler la vente
            if (commande.typeClient=== 'Client') {
                // Supprimer dans la table Paiement
                let paiement = await Paiement.findOne({ referenceFacture:referenceFacture  });
                if (paiement) {
                    await Paiement.findByIdAndDelete(paiement._id);
                    console.log("Paiement supprimé pour ajuster le chiffre d'affaires.");
                }
            } else if (commande.typeClient === 'Commercial') {
                // Supprimer dans la table Commerciale
                let commerciale = await PaiementCommerciale.findOne({ referenceFacture: referenceFacture });
                if (commerciale) {
                    await PaiementCommerciale.findByIdAndDelete(commerciale._id);
                    console.log("Commerciale supprimé pour ajuster le chiffre d'affaires.");
                }
            }
            await Vente.findByIdAndDelete(vente._id);

            // Marquer la commande comme annulée
            commande.statut = 'annulée';
            await commande.save();

            return res.status(200).json({
                message: "✅ Vente annulée avec succès (chiffre d'affaires ajusté), mais aucun produit n'a été retourné au stock",
                referenceFacture,
            });
        }

        // Si la commande est payée et livrée, on retourne les produits dans le stock
        if (commande.statut === 'payé et livré' ) {
            console.log('Commande payée et livrée, début de la restitution des produits...');

            // Restaurer le stock pour chaque produit de la vente
            await Promise.all(commande.produits.map(async (item) => {
                let produitId = item.produit._id;
                let entrepotId = item.entrepotId._id;
                let produit = await Produit.findById(produitId);
            
                // Vérifiez que l'unité choisie est bien définie
                let uniteChoisie = item.uniteChoisie;
                if (!uniteChoisie) {
                    console.log(`Unité choisie non définie pour le produit ${item.produit.nom}`);
                    throw new Error(`L'unité choisie pour le produit ${item.produit.nom} est introuvable.`);
                }
            
                console.log(`Traitement du produit ${item.produit.nom} avec l'unité choisie : ${uniteChoisie}`);
            
                // Vérification de l'unité choisie dans le produit
                let uniteProduit = produit.unites.find(unite => unite.nom === uniteChoisie);
                if (!uniteProduit) {
                    console.log(`L'unité choisie ${uniteChoisie} pour le produit ${item.produit.nom} est introuvable.`);
                    throw new Error(`L'unité choisie ${uniteChoisie} pour le produit ${item.produit.nom} est introuvable.`);
                }
            
                // Conversion de la quantité selon l'unité choisie
                let { quantite: quantiteRestituee, unite } = convertirUnite(item.quantite, uniteChoisie, produit.unites);
            
                console.log(`Quantité convertie : ${quantiteRestituee} ${unite}`);
            
                // Trouver ou créer un stock pour ce produit et cet entrepôt
                let stock = await Stock.findOne({ produit: produitId, entrepot: entrepotId });
                if (!stock) {
                    stock = new Stock({
                        produit: produitId,
                        entrepot: entrepotId,
                        quantite: 0,
                        valeurTotale: 0,
                        prixUnitaire: item.prixdevente,
                    });
                    console.log(`Création d'un nouveau stock pour ${item.produit.nom} dans l'entrepôt ${entrepotId}`);
                }
            
                // Ajouter la quantité restituée au stock
                stock.quantite += quantiteRestituee;
                stock.valeurTotale = stock.quantite * stock.prixUnitaire;
            
                console.log(`Stock mis à jour : ${stock.quantite} unités disponibles pour ${item.produit.nom} dans l'entrepôt ${entrepotId}`);
            
                await stock.save();
            }));
            

            // Annuler la vente
            await Vente.findByIdAndDelete(vente._id);
            if (commande.typeClient=== 'Client') {
                // Supprimer dans la table Paiement
                let paiement = await Paiement.findOne({ referenceFacture:referenceFacture  });
                if (paiement) {
                    await Paiement.findByIdAndDelete(paiement._id);
                    console.log("Paiement supprimé pour ajuster le chiffre d'affaires.");
                }
            } 
            else if (commande.typeClient === 'Commercial') {
                // Chercher dans la collection PaiementCommerciale, pas Paiement
                let commerciale = await PaiementCommerciale.findOne({ referenceFacture: referenceFacture });
                
                if (commerciale) {
                    await PaiementCommerciale.findByIdAndDelete(commerciale._id);
                    console.log("Paiement Commercial supprimé pour ajuster le chiffre d'affaires.");
                } else {
                    console.log("Aucun paiement Commercial trouvé pour cette facture.");
                }
            }
            
            // Marquer la commande comme annulée
            commande.statut = 'annulée';
            await commande.save();

            return res.status(200).json({
                message: "✅ Vente annulée avec succès, produits retournés au stock et chiffre d'affaires ajusté",
                referenceFacture,
                produitsRestitues: vente.produits.map(item => {
                    // Assurez-vous de récupérer l'unité choisie du produit dans la commande
                    let uniteChoisie = item.uniteChoisie;
            
                    // Vérification que l'unité choisie existe pour chaque produit
                    if (!uniteChoisie) {
                        console.log(`Unité choisie pour le produit ${item.produit.nom} est introuvable.`);
                        uniteChoisie = 'Unité non définie'; // Si aucune unité choisie, définir comme "non définie"
                    }
            
                    console.log(`Produit: ${item.produit.nom}, Quantité: ${item.quantite}, Unité: ${uniteChoisie}`); // Optionnel, pour le débogage
            
                    return {
                        produit: item.produit.nom,
                        quantite: item.quantite,
                        unite: uniteChoisie  // Assurez-vous que l'unité choisie est passée ici
                    };
                }),
            });
            
        }

        res.status(400).json({ message: "Statut de commande invalide pour annulation" });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
