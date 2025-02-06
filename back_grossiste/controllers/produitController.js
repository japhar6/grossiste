const Produit = require("../models/Produits");
const Fournisseur = require("../models/Fournisseurs");

// ✅ Ajouter un produit
exports.ajouterProduit = async (req, res) => {
    try {
        const { nom, description, prixdevente, prixDachat, categorie, unite, fournisseur } = req.body;

        // Vérification des champs obligatoires
        if (!nom || !prixDachat  || !categorie || !unite) {
            return res.status(400).json({ message: "❌ Veuillez remplir tous les champs obligatoires." });
        }

        // Vérifier si le fournisseur existe
        if (fournisseur) {
            const fournisseurExistant = await Fournisseur.findById(fournisseur);
            if (!fournisseurExistant) {
                return res.status(404).json({ message: "❌ Fournisseur introuvable." });
            }
        }

        // Création du produit
        const nouveauProduit = new Produit({ nom, description, prixdevente, prixDachat, categorie, unite, fournisseur });
        await nouveauProduit.save();

        res.status(201).json({ message: "✅ Produit ajouté avec succès", produit: nouveauProduit });

    } catch (error) {
        console.error("Erreur lors de l'ajout du produit:", error);
        res.status(500).json({ message: "❌ Erreur serveur", error: error.message });
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


// ✅ Modifier un produit
exports.modifierProduit = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, description, prixdevente, prixDachat, categorie, unite, fournisseur } = req.body;

        // Vérifier si le produit existe
        const produitExistant = await Produit.findById(id);
        if (!produitExistant) {
            return res.status(404).json({ message: "❌ Produit introuvable." });
        }

        // Vérifier si le fournisseur fourni existe
        if (fournisseur) {
            const fournisseurExistant = await Fournisseur.findById(fournisseur);
            if (!fournisseurExistant) {
                return res.status(404).json({ message: "❌ Fournisseur non trouvé." });
            }
        }

        // Mettre à jour le produit uniquement avec les champs envoyés
        const produitModifie = await Produit.findByIdAndUpdate(
            id,
            { 
                nom: nom || produitExistant.nom,
                description: description || produitExistant.description,
                prixdevente: prixdevente || produitExistant.prixdevente,
                prixdachat: prixDachat || produitExistant.prixdachat,
             
                categorie: categorie || produitExistant.categorie,
                unite: unite || produitExistant.unite,
                fournisseur: fournisseur || produitExistant.fournisseur,
            },
            { new: true }
        ).populate("fournisseur", "nom contact");

        res.status(200).json({ message: "✅ Produit modifié avec succès", produit: produitModifie });

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
