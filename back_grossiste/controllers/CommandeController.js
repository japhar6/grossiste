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
                return {
                    produit: item.produit,
                    nomProduit: produit.nom,
                    quantite: item.quantite,
                    prixUnitaire: produit.prixdevente,
                    total: produit.prixdevente * item.quantite
                };
            })
        );

        // Calcul du montant total
        const totalGeneral = produitsAvecPrix.reduce((acc, item) => acc + item.total, 0);

        // Création de la commande
        const nouvelleCommande = new Commande({
            client: { nom, numero, adresse }, // Structure corrigée
            modePaiement,
            statut: "en cours", // Vérifié dans le modèle
            produits: produitsAvecPrix,
            totalGeneral
        });

        // Sauvegarde dans la base de données
        await nouvelleCommande.save();

        res.status(201).json({ message: "Bon de commande ajouté avec succès", commande: nouvelleCommande });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
