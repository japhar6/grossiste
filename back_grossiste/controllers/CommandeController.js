const Commande = require("../models/Commandes");
const Produit = require("../models/Produits");
const Client = require("../models/Client");
const Commercial = require("../models/Commercial");

exports.ajouterCommande = async (req, res) => {
    try {
        const { typeClient, clientId, commercialId, vendeurId, produits, statut } = req.body;

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
        
            let typeRemise = "aucune";
            let valeurRemise = 0;
            let prixApresRemise = prixdevente;
            let montantApresRemise = totalProduit;  // Initialisation avec le total produit
        
            // Vérification des remises sur le client/commercial
            if (typeClient === "Client" && clientOuCommercial.remises) {
                if (clientOuCommercial.remises.remiseParProduit) {
                    typeRemise = "remiseParProduit";
                    valeurRemise = clientOuCommercial.remises.remiseParProduit;
                    prixApresRemise = prixdevente * (1 - valeurRemise / 100);  // Remise par produit
                }
                
                // Ajouter la logique pour la remise fixe
                if (clientOuCommercial.remises.remiseFixe) {
                    typeRemise = "remiseFixe";
                    valeurRemise = clientOuCommercial.remises.remiseFixe;  // Récupérer la remise fixe
                    montantApresRemise = totalProduit - valeurRemise;  // Appliquer la remise fixe
                }
                // Ajouter la logique pour la remise globale
                if (clientOuCommercial.remises.remiseGlobale) {
                    typeRemise = "remiseGlobale";
                    valeurRemise = clientOuCommercial.remises.remiseGlobale;  // Récupérer la remise globale (en %)
                    montantApresRemise = totalProduit - (totalProduit * valeurRemise / 100);  // Appliquer la remise globale sur le total produit
                }
            }
        
            const totalApresRemise = montantApresRemise;  // Total après remise fixe
        
            return {
                produit: produit._id,
                quantite: produitData.quantite,
                prixdevente,
                total: totalProduit,
                prixApresRemise,
                montantApresRemise,  // Ajout de montant après remise fixe
                typeRemise,
                valeurRemise,
                uniteChoisie: uniteChoisie.nom
            };
        }));
        
        // Calcul du total général des produits après la remise par produit et remise fixe
        let totalGeneral = produitsDetails.reduce((acc, produit) => acc + produit.montantApresRemise, 0);
        
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

        // Si la commande est activée, réinitialiser la remise du client à zéro
        if (statut === "en cours" && typeClient === "Client" && clientOuCommercial) {
            clientOuCommercial.remises.remiseGlobale = 0;
            clientOuCommercial.remises.remiseFixe = 0;
            clientOuCommercial.remises.remiseParProduit = 0;
            await clientOuCommercial.save();
        }
        
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



// Récupérer une commande par sou référence
exports.getCommandeByref = async (req, res) => {
    try {
        const { referenceFacture } = req.params;
        let commande;

        if (referenceFacture) {
            commande = await Commande.findOne({ referenceFacture })
                .populate("clientId", "nom telephone")
                .populate("commercialId", "nom telephone")
                .populate("produits.produit", "nom");
        } else {
            commande = await Commande.findById(req.params.id)
                .populate("clientId", "nom telephone")
                .populate("commercialId", "nom telephone")
                .populate("produits.produit", "nom");
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