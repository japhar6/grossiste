const Panier = require("../models/Paniers");

exports.creerPanier = async (req, res) => {
    try {
        const nouveauPanier = new Panier({ achats: [], totalGeneral: 0 });
        await nouveauPanier.save();
        res.status(201).json({ message: "Panier créé avec succès", panier: nouveauPanier });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création du panier", error: error.message });
    }
};

exports.getAllPaniers = async (req, res) => {
    try {
        const paniers = await Panier.find().populate("achats");
        res.status(200).json({ paniers });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des paniers", error });
    }
};

exports.supprimerPanier = async (req, res) => {
    try {
        const { panierId } = req.params;
        const panier = await Panier.findById(panierId);

        if (!panier) {
            return res.status(404).json({ message: "Panier non trouvé" });
        }

        await Panier.findByIdAndDelete(panierId);
        res.status(200).json({ message: "Panier supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du panier", error });
    }
};
