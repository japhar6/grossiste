const Paiement = require("../models/Paiement");
const Commande = require("../models/Commandes")
;

exports.validerpayement = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut, remiseGlobale, remiseParProduit, remiseFixe, idCaissier } = req.body; // Ajout de remiseFixe
  
        // Recherche de la commande par ID
        const commande = await Commande.findById(id);
        if (!commande) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }
  
       // Calcul du montant après remise globale
let montantFinalPaye = commande.totalGeneral;
let montanApres = montantFinalPaye; // Valeur initiale

// Si remise globale est spécifiée et non égale à 0, l'appliquer
if (remiseGlobale && remiseGlobale > 0) {
    montanApres -= montanApres * (remiseGlobale / 100);
    console.log("Total après remise globale:", montanApres); 
}

// Calcul du montant après remise par produit
let produitsAvecRemises = [];
if ((!remiseGlobale || remiseGlobale === 0) && remiseParProduit && Array.isArray(remiseParProduit)) {
    // Appliquer remise par produit sans modifier la commande
    produitsAvecRemises = commande.produits.map(item => {
        const produitRemise = remiseParProduit.find(rp => rp.produitId.toString() === item.produit.toString());

        if (produitRemise) {
            const remiseProduit = produitRemise.remise || 0;
            const prixProduit = item.prixUnitaire;
            const prixApresRemise = prixProduit - (prixProduit * (remiseProduit / 100));
            const totalProduit = prixApresRemise * item.quantite;

            return {
                produitId: item.produit,
                remise: remiseProduit,
                prixAvantRemise: prixProduit,
                prixApresRemise: prixApresRemise,
                totalProduit: totalProduit
            };
        }

        return null; // Aucun changement si pas de remise appliquée
    }).filter(item => item !== null); // Supprimer les éléments null qui n'ont pas eu de remise

    // Calcul final du montant après remise par produit
    if (produitsAvecRemises.length > 0) {
        montanApres = produitsAvecRemises.reduce((acc, item) => acc + item.totalProduit, 0);
        console.log("Montant final après remise par produit :", montanApres);
    }
}

// Appliquer la remise fixe si elle est fournie
if (remiseFixe && remiseFixe > 0) {
    montanApres -= remiseFixe;
    console.log("Total après remise fixe:", montanApres);
}

// Si aucune remise n'est appliquée, utiliser le montant final sans modification
if (montanApres === montantFinalPaye) {
    montanApres = montantFinalPaye;
}
        // Mettre à jour le statut de la commande
        commande.statut = "terminée";
        await commande.save();
  
        // Créer un paiement avec le montant correctement mis à jour
        const paiement = new Paiement({
            commandeId: commande._id,
            montantPaye: montanApres,  // Montant final après remise
        
            totalPaiement: montanApres,  // Le même montant ici aussi
            statut: "complet",
            remiseGlobale: remiseGlobale || 0,
            remiseParProduit: remiseParProduit || [],
            remiseFixe: remiseFixe || 0 ,
            idCaissier  
        });
  
        // Sauvegarder le paiement dans la base de données
        await paiement.save();
  
        return res.status(200).json({ message: "Paiement validé avec succès", paiement: {
            commandeId: paiement.commandeId,
            montantPaye: paiement.montantPaye,
            statut: paiement.statut,
            remiseGlobale: paiement.remiseGlobale,
            remiseParProduit: paiement.remiseParProduit,
            remiseFixe: paiement.remiseFixe,  
            totalPaiement: paiement.totalPaiement,
            produitsAvecRemises: produitsAvecRemises,
            montantFinal: montanApres
        } });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 



// Récupérer tous les paiements des client 
exports.getPaiements = async (req, res) => {
    try {
        const paiements = await Paiement.find();
        res.status(200).json(paiements);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer un paiement par son ID
exports.getPaiementById = async (req, res) => {
    try {
        const paiement = await Paiement.findById(req.params.id);
        if (!paiement) {
            return res.status(404).json({ message: "Paiement non trouvé" });
        }
        res.status(200).json(paiement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
