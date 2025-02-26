const Produit = require("../models/Produits");
const Fournisseur = require("../models/Fournisseurs");

// ✅ Ajouter un produit
exports.ajouterProduit = async (req, res) => {
    try {
        const { nom, description,prixDachat, categorie, fournisseur, quantiteMinimum, unites } = req.body;

        // Vérification des champs obligatoires
        if (!nom || !categorie || !unites || !Array.isArray(unites) || unites.length === 0) { 
            return res.status(400).json({ message: "❌ Veuillez remplir tous les champs obligatoires et ajouter au moins une unité." });
        }

        // Vérifier si chaque unité contient les champs nécessaires
        for (let unite of unites) {
            if (!unite.nom || !unite.conversion ) {
                return res.status(400).json({ message: "❌ Chaque unité doit avoir un nom, un facteur de conversion et un prix de vente." });
            }
        }

        // Déterminer l'unité principale (celle avec la plus grande conversion)
        const unitePrincipale = unites.reduce((max, u) => (u.conversion > max.conversion ? u : max), unites[0]);

        // Vérifier si le fournisseur existe
        if (fournisseur) {
            const fournisseurExistant = await Fournisseur.findById(fournisseur);
            if (!fournisseurExistant) {
                return res.status(404).json({ message: "❌ Fournisseur introuvable." });
            }
        }

        // Création du produit avec l'unité principale et la liste des unités
        const nouveauProduit = new Produit({
            nom,
            description,
            categorie,
            fournisseur,
            quantiteMinimum: quantiteMinimum || 0,
            unites,
            prixDachat
        });

        await nouveauProduit.save();

        res.status(201).json({ message: "✅ Produit ajouté avec succès", produit: nouveauProduit });
    } catch (error) {
        console.error("Erreur lors de l'ajout du produit:", error);
        res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
    }
};

// ✅ Récupérer les produits d'un fournisseur spécifique
exports.getProduitsParFournisseur = async (req, res) => {
    try {
        const { fournisseurId } = req.params;
        const produits = await Produit.find({ fournisseur: fournisseurId });

        if (!produits.length) {
            return res.status(404).json({ message: "Aucun produit trouvé pour ce fournisseur." });
        }

        res.status(200).json(produits);
    } catch (error) {
        console.error("Erreur lors de la récupération des produits du fournisseur :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// ✅ Récupérer tous les produits
exports.afficherProduits = async (req, res) => {
    try {
        const produits = await Produit.find().populate("fournisseur", "nom contact");
        res.status(200).json(produits);
    } catch (error) {
        res.status(500).json({ message: "❌ Erreur lors de la récupération des produits", error: error.message });
    }
};

exports.countProduits = async (req, res) => {
    try {
      const count = await Produit.countDocuments();
      res.status(200).json({ totalProduits: count });
    } catch (error) {
      res.status(500).json({ message: "❌ Erreur lors du comptage des produits", error });
    }
  };
// ✅ Modifier un produit
exports.modifierProduit = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, description, categorie, fournisseur, prixDachat,quantiteMinimum, unites } = req.body;

        // Vérifier si le produit existe
        const produitExistant = await Produit.findById(id);
        if (!produitExistant) {
            return res.status(404).json({ message: "❌ Produit introuvable." });
        }

        // Vérifier si chaque unité contient les champs nécessaires (si mis à jour)
        if (unites) {
            for (let unite of unites) {
                if (!unite.nom || !unite.conversion ) {
                    return res.status(400).json({ message: "❌ Chaque unité doit avoir un nom, un facteur de conversion et un prix de vente." });
                }
            }
        }

        // Déterminer l'unité principale pour ajuster le prix d'achat
        const unitePrincipale = unites 
            ? unites.reduce((max, u) => (u.conversion > max.conversion ? u : max), unites[0])
            : produitExistant.unites.reduce((max, u) => (u.conversion > max.conversion ? u : max), produitExistant.unites[0]);

        // Vérifier si le fournisseur fourni existe
        if (fournisseur) {
            const fournisseurExistant = await Fournisseur.findById(fournisseur);
            if (!fournisseurExistant) {
                return res.status(404).json({ message: "❌ Fournisseur non trouvé." });
            }
        }

        // Mise à jour du produit
        const produitModifie = await Produit.findByIdAndUpdate(
            id,
            { 
                nom: nom || produitExistant.nom,
                description: description || produitExistant.description,
                categorie: categorie || produitExistant.categorie,
                fournisseur: fournisseur || produitExistant.fournisseur,
                quantiteMinimum: quantiteMinimum !== undefined ? quantiteMinimum : produitExistant.quantiteMinimum,
                unites: unites || produitExistant.unites,
                prixDachat: prixDachat
            },
            { new: true }
        ).populate("fournisseur", "nom contact");

        res.status(200).json({ message: "✅ Produit modifié avec succès", produit: produitModifie });

    } catch (error) {
        res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
    }
};
// ✅ Récupérer le prix d'achat d'une unité spécifique
exports.getPrixDachatParUnite = async (req, res) => {
    try {
        const { id, uniteNom } = req.params;

        // Vérifier si le produit existe
        const produit = await Produit.findById(id);
        if (!produit) {
            return res.status(404).json({ message: "❌ Produit introuvable." });
        }

        // Trouver l'unité demandée
        const unite = produit.unites.find(u => u.nom.toLowerCase() === uniteNom.toLowerCase());
        if (!unite) {
            return res.status(404).json({ message: `❌ Unité '${uniteNom}' non trouvée pour ce produit.` });
        }

        // Calculer le prix d'achat pour cette unité
        const prixDachat = produit.prixDachat / unite.conversion;

        res.status(200).json({ unite: uniteNom, prixDachat });

    } catch (error) {
        res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
    }
};


// ✅ Supprimer un produit
exports.supprimerProduit = async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier si le produit existe
        const produitExistant = await Produit.findById(id);
        if (!produitExistant) {
            return res.status(404).json({ message: "❌ Produit introuvable." });
        }

        // Supprimer le produit
        await Produit.findByIdAndDelete(id);
        res.status(200).json({ message: "✅ Produit supprimé avec succès" });

    } catch (error) {
        res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
    }
};
