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
  
  
module.exports = router;
