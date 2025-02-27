const express = require("express");
const router = express.Router();
const produitController = require("../controllers/produitController");
const Produit = require("../models/Produits");
// Route pour ajouter un produit
router.post("/ajouter", produitController.ajouterProduit);
router.get("/afficher", produitController.afficherProduits);
router.put("/modifier/:id", produitController.modifierProduit);
router.delete("/supprimer/:id", produitController.supprimerProduit);
router.get("/count", produitController.countProduits);
router.get("/fournisseur/:fournisseurId", produitController.getProduitsParFournisseur);

router.get('/categories', async (req, res) => {
    try {

      const categories = await Produit.distinct('categorie');
      res.json(categories); 
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des catégories' });
    }
  });
 
  router.get('/recuperer/:id', (req, res) => {
    const produitId = req.params.id;
  
  
    Produit.findById(produitId)
      .then((produit) => {
        if (!produit) {
          return res.status(404).json({ message: "Produit non trouvé" });
        }
        res.json(produit); 
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
      });
  });
  

 

// Route pour mettre à jour le prix d'achat d'un produit
router.put('/produits/maodi/:id', async (req, res) => {
    const { prixDachat, uniteNom } = req.body; // Récupérer le prix et l'unité de la requête
    const produitId = req.params.id;

    try {
        // Récupérer le produit par ID
        const produit = await Produit.findById(produitId);
        if (!produit) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        // Trouver l'unité correspondante
        const unite = produit.unites.find(u => u.nom === uniteNom);
        if (!unite) {
            return res.status(400).json({ message: 'Unité non trouvée pour le produit' });
        }

        // Calculer le prix d'achat en fonction de la conversion
        let nouveauPrixDachat;
        if (unite.conversion === 1) {
            // Si l'unité a une conversion de 1, utiliser le prix donné
            nouveauPrixDachat = prixDachat;
        } else {
            // Sinon, calculer le prix d'achat en fonction de la conversion
            nouveauPrixDachat = prixDachat * unite.conversion;
        }

        // Mettre à jour le produit avec le nouveau prix d'achat
        produit.prixDachat = nouveauPrixDachat;
        await produit.save();

        res.json({ message: 'Prix d\'achat mis à jour avec succès', produit });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du produit:", error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du produit' });
    }
});




router.put('/produits/modifier-prix-vente/:id', async (req, res) => {
  try {
      const { prixdevente, uniteNom } = req.body;
      const produitId = req.params.id; // Assurez-vous d'utiliser le bon paramètre

      // Validation
      if (!prixdevente || !uniteNom) {
          return res.status(400).json({ error: "Prix de vente et nom d'unité sont requis." });
      }

      const produit = await Produit.findById(produitId);
      if (!produit) {
          return res.status(404).json({ error: "Produit non trouvé." });
      }

      // Mettre à jour le prix de vente de l'unité correspondante
      const unite = produit.unites.find(u => u.nom === uniteNom);
      if (!unite) {
          return res.status(400).json({ message: "Unité non trouvée pour le produit." });
      }

      unite.prixdevente = prixdevente; // Mise à jour du prix de vente de l'unité
      await produit.save();

      res.status(200).json({ message: "Prix de vente mis à jour avec succès.", produit });
  } catch (error) {
      console.error("Erreur lors de la mise à jour du prix de vente:", error);
      res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

  

router.put('/produits/modifier-quantite-minimum/:id', async (req, res) => {
  const { quantiteMinimum } = req.body;
  const produitId = req.params.id;

  try {
      const produit = await Produit.findById(produitId);
      if (!produit) {
          return res.status(404).json({ message: 'Produit non trouvé' });
      }

      produit.quantiteMinimum = quantiteMinimum;
      await produit.save();

      res.json({ message: 'Quantité minimum mise à jour avec succès', produit });
  } catch (error) {
      console.error("Erreur lors de la mise à jour de la quantité minimum:", error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la quantité minimum' });
  }
});


module.exports = router;
