const Commande = require("../models/Commandes");
const Produit = require("../models/Produits");
const Client = require("../models/Client");
const Commercial = require("../models/Commercial");

exports.ajouterCommande = async (req, res) => {
    try {
        const { typeClient, clientId, commercialId, vendeurId, produits, modePaiement, statut } = req.body;

        // Vérifier que typeClient est fourni
        if (!typeClient || !["Client", "Commercial"].includes(typeClient)) {
            return res.status(400).json({ message: "typeClient doit être 'Client' ou 'Commercial'." });
        }

        let clientOuCommercial;
        if (typeClient === "Client") {
            if (!clientId) return res.status(400).json({ message: "clientId est requis pour un Client." });
            clientOuCommercial = await Client.findById(clientId);
        } else {
            if (!commercialId) return res.status(400).json({ message: "commercialId est requis pour un Commercial." });
            clientOuCommercial = await Commercial.findById(commercialId);
        }

        // Vérifier si le client ou commercial existe
        if (!clientOuCommercial) {
            return res.status(404).json({ message: `${typeClient} non trouvé avec cet ID.` });
        }

        // Forcer le mode de paiement à "à crédit" si c'est un commercial
        const paiementFinal = typeClient === "Commercial" ? "à crédit" : modePaiement;

        // Vérifier que tous les produits existent
        const produitsDetails = await Promise.all(produits.map(async (item) => {
            const produit = await Produit.findById(item.produit);
            if (!produit) throw new Error(`Produit avec ID ${item.produit} non trouvé.`);
            
            const prixUnitaire = produit.prixdevente;
            const totalProduit = prixUnitaire * item.quantite;

            return {
                produit: produit._id,
                quantite: item.quantite,
                prixUnitaire,
                total: totalProduit
            };
        }));

        // Calcul du total général
        const totalGeneral = produitsDetails.reduce((acc, item) => acc + item.total, 0);

        // Création de la commande
        const nouvelleCommande = new Commande({
            typeClient,
            clientId: typeClient === "Client" ? clientId : null,
            commercialId: typeClient === "Commercial" ? commercialId : null,
            vendeurId,
            modePaiement: paiementFinal,
            produits: produitsDetails,
            totalGeneral,
            statut
        });

        // Enregistrement
        await nouvelleCommande.save();

        res.status(201).json({
            message: "Commande créée avec succès.",
            commande: nouvelleCommande
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer toutes les commandes
exports.getCommandes = async (req, res) => {
    try {
        const commandes = await Commande.find();
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

// Récupérer une commande par son ID ou référence
exports.getCommandeById = async (req, res) => {
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
            statut: { $in: ["terminée", "livrée"] }
        })
        .populate("produits.produit", "nom unite")  // Récupérer les produits associés (nom du produit)
        .populate("produits.fournisseur", "nom")  // Récupérer les informations du fournisseur (nom)
        .populate("clientId", "nom telephone")  // Récupérer les informations du client
        .populate("commercialId", "nom telephone")
        .populate("vendeurId", "nom")  // Récupérer les informations du vendeur

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
        const commandes = await Commande.find({ vendeurId }).populate('produits.produit', 'nom prixDachat'); // Ajustez les champs si nécessaire

        if (!commandes || commandes.length === 0) {
            return res.status(404).json({ message: "Aucune commande trouvée pour ce vendeur" });
        }

        res.status(200).json(commandes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};