const Commande = require("../models/Commandes");
const Produit = require("../models/Produits");

exports.ajouterBDC = async (req, res) => {
    try {
        const { nom, numero, adresse, modePaiement, produits } = req.body;

        // Vérification et récupération des produits avec leur prix de vente
        const produitsAvecPrix = await Promise.all(
            produits.map(async (item) => {
                const produit = await Produit.findById(item.produit);
                if (!produit) {
                    throw new Error(`Le produit avec l'ID ${item.produit} n'existe pas.`);
                }

                const prixProduit = produit.prixdevente;

                // Pas de remise ici, juste calculer le total produit sans remise
                const totalProduit = prixProduit * item.quantite;

                return {
                    produit: item.produit,
                    nomProduit: produit.nom,
                    quantite: item.quantite,
                    prixUnitaire: prixProduit, // Prix sans remise
                    total: totalProduit, // Total sans remise
                    remise: 0
                };
            })
        );

        // Calcul du montant total de la commande sans remise
        const totalGeneral = produitsAvecPrix.reduce((acc, item) => acc + item.total, 0);

        // Création de la commande sans remise
        const nouvelleCommande = new Commande({
            client: { nom, numero, adresse },
            modePaiement,
            statut: "en cours", // Commande en cours, pas encore payée
            produits: produitsAvecPrix,
            totalGeneral
        });

        // Sauvegarde de la commande dans la base de données
        await nouvelleCommande.save();

        res.status(201).json({ message: "Bon de commande ajouté avec succès", commande: nouvelleCommande });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.validerCommande = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut, remiseGlobale, remiseParProduit } = req.body;

        // Recherche de la commande par ID
        const commande = await Commande.findById(id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        // Si remise globale est spécifiée, l'appliquer
        if (remiseGlobale) {
            // Calcul du total sans remise
            let totalGeneral = commande.produits.reduce((acc, item) => acc + item.total, 0);

            // Appliquer la remise globale
            totalGeneral -= totalGeneral * (remiseGlobale / 100);

            commande.remiseGlobale = remiseGlobale;
            commande.totalGeneral = totalGeneral;

            // Mettre à jour le statut de la commande
            commande.statut = statut || commande.statut;

            // Sauvegarde de la commande mise à jour
            await commande.save();

            return res.status(200).json({ message: "Commande validée avec remise globale", commande });
        }

        // Si remise par produit est spécifiée, l'appliquer
        if (remiseParProduit && Array.isArray(remiseParProduit)) {
            commande.produits = commande.produits.map(item => {
                // Chercher la remise par produit correspondant à cet ID de produit
                const produitRemise = remiseParProduit.find(rp => rp.produit.toString() === item.produit.toString());
                
                if (produitRemise) {
                    const remiseProduit = produitRemise.remise || 0; // Remise par produit si définie
                    const prixProduit = item.prixUnitaire;
                    const prixApresRemise = prixProduit - (prixProduit * (remiseProduit / 100)); // Calcul de la remise par produit

                    // Mettre à jour le prix unitaire et le total du produit
                    const totalProduit = prixApresRemise * item.quantite;

                    return {
                        ...item,
                        prixUnitaire: prixApresRemise, // Prix après remise
                        total: totalProduit, // Total après remise
                        remise: remiseProduit // Ajout de la remise au produit
                    };
                }
                
                return item; // Si pas de remise pour ce produit, retour à l'élément sans modification
            });

            // Calcul du montant total après application des remises par produit
            let totalGeneral = commande.produits.reduce((acc, item) => acc + item.total, 0);

            commande.totalGeneral = totalGeneral;

            // Mettre à jour le statut de la commande
            commande.statut = statut || commande.statut;

            // Sauvegarde de la commande mise à jour
            await commande.save();

            return res.status(200).json({ message: "Commande validée avec remise par produit", commande });
        }

        res.status(400).json({ message: "Aucune remise spécifiée" });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
