import React, { useState } from "react";
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";
import "../Styles/Caisse.css";
import Swal from 'sweetalert2';

import Sound from "../assets/mixkit-clear-announce-tones-2861.wav"
import axios from '../api/axios';
function PaiementCom() {
  const [referenceFacture, setReferenceFacture] = useState("");
  const [commande, setCommande] = useState(null);
  const [commercial, setCommercial] = useState(null);
  const [produitsRetournes, setProduitsRetournes] = useState({});
  const [produitsVendus, setProduitsVendus] = useState([]);
  const playSound = () => {
                const audio = new Audio(Sound); 
                audio.play();
            };
            
  // Recherche de la commande en fonction de la référence
  const handleSearch = async () => {
    if (!referenceFacture) return; // Validation si la référence est vide

    try {
<<<<<<< HEAD
      const response = await fetch(`https://api.bazariko.duckdns.org/api/commandes/reference/${referenceFacture}`);
      if (!response.ok) throw new Error("Commande non trouvée");
      const data = await response.json();
=======
        const response = await axios.get(`/commandes/reference/${referenceFacture}`);
>>>>>>> dev

        // Vérifie si la réponse est un succès
        if (response.status !== 200) throw new Error("Commande non trouvée");

        const data = response.data;

        // Vérifie si le type de client est Commercial
        if (data.typeClient === "Commercial") {
            setCommercial(data.commercialId);
        } else {
            // Affiche une alerte si le type n'est pas Commercial
            Swal.fire({
                icon: 'warning',
                title: 'Alerte',
                text: 'Seules les références de facture de type commercial peuvent être traitées ici.',
            });
            setCommande(null);
            setCommercial(null);
            return; // Arrête le traitement si ce n'est pas commercial
        }

        // Mise à jour de l'état des commandes et des produits
        setCommande(data);
        setProduitsRetournes({});
        setProduitsVendus([]);
    } catch (error) {
        console.error("Erreur lors de la recherche de la commande :", error);
        
        // Affiche un message d'erreur spécifique si la commande n'est pas trouvée
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.response && error.response.status === 404 ? "Référence non trouvée." : "Erreur lors de la recherche de la commande",
        });

        setCommande(null);
        setCommercial(null);
    }
};


  const handleQuantiteChange = (produitId, quantiteDisponible, e) => {
    const quantite = parseInt(e.target.value) || 0; // Convertit en nombre, ou 0 si vide

    if (produitId) {
        if (quantite > quantiteDisponible) { // Vérification de la quantité disponible
            Swal.fire({
                icon: 'warning',
                title: 'Alerte',
                text: `La quantité saisie ne doit pas dépasser ${quantiteDisponible} pour ce produit.`,
            });
            // Réinitialiser l'input en le mettant à la quantité disponible
            e.target.value = quantiteDisponible; // Réinitialiser l'input
        } else {
            setProduitsVendus((prev) => {
                const updatedProduits = [...prev];
                const index = updatedProduits.findIndex(p => p.produitId === produitId);
                if (index >= 0) {
                    updatedProduits[index].quantite = quantite;
                } else {
                    updatedProduits.push({ produitId, quantite });
                }
                return updatedProduits;
            });
        }
    }
};




  // Calcul du total après retour de produits
  const calculerTotalApresRetour = () => {
    if (!commande) return 0;

    return commande.produits.reduce((total, produit) => {
      const quantiteRetournee = parseInt(produitsRetournes[produit.produit.id] || 0);
      const nouvelleQuantite = Math.max(produit.quantite - quantiteRetournee, 0);
      return total + nouvelleQuantite * produit.prixUnitaire;
    }, 0);
  };

  // Validation de la commande et mise à jour de la vente
  const handleValidation = async () => {
    const produitsInvalides = produitsVendus.filter(p => !p.produitId || p.quantite <= 0);
    if (produitsInvalides.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Alerte',
            text: "Certains produits sont invalides, assurez-vous que chaque produit a un ID valide et une quantité positive.",
        });
        return;
    }

    try {
        // Prépare les données à envoyer
        const produitsVendusToSend = produitsVendus.map(produit => ({
            produitId: produit.produitId,
            quantite: produit.quantite,
        }));

        const response = await axios.put(`/paiementCom/mettre-ajour/${referenceFacture}`, {
            produitsVendus: produitsVendusToSend,
        });

        // Vérifiez le statut du paiement
        if (response.data.message === "Le paiement doit être partiel pour pouvoir être mis à jour.") {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: "Le paiement est déjà complet.",
            });
            return; // Arrêtez l'exécution si le paiement est complet
        }

        Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: "Paiement et vente mis à jour avec succès",
        });
        playSound();
          // Réinitialisation des états après validation réussie
          setReferenceFacture("");
          setCommande(null);
          setCommercial(null);
          setProduitsRetournes({});
          setProduitsVendus([]);
       
    } catch (error) {
        console.error("Erreur lors de la mise à jour du paiement :", error);

        // Vérifiez si l'erreur contient une réponse
        const errorMessage = error.response && error.response.data ? error.response.data.message : "Une erreur s'est produite lors de la mise à jour du paiement";
        
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: errorMessage,
        });
    }
};


  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3">
            <h6 className="alert alert-info text-start">
              <i className="fa fa-shopping-cart"></i> Caisse
            </h6>

            <div className="commande-container d-flex justify-content-between">
              <div className="refcli">
                <h6><i className="fa fa-user"></i> Référence de la commande du commercial</h6>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Entrer la référence"
                    value={referenceFacture}
                    onChange={(e) => setReferenceFacture(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={handleSearch}>
                    Rechercher
                  </button>
                </div>
              </div>

              <div className="produits p-3">
                <h6><i className="fa fa-box"></i> Détails du paiement </h6>
                <table className="tableCS mt-2">
                  <thead>
                    <tr>
                      <th>Commercial</th>
                      <th>Contact</th>
                      <th>Mode de paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{commercial?.nom}</td>
                      <td>{commercial?.telephone}</td>
                      <td>{commande?.modePaiement || ""}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {commande && (
              <div className="commandeX mt-4">
                <h6><i className="fa fa-receipt"></i> Récapitulatif de la Commande</h6>
                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                  <table className="tableCS table-bordered mt-2 text-center">
                    <thead>
                      <tr>
                        <th>Nom du produit</th>
                        <th>Quantité</th>
                        <th>Prix Unitaire</th>
                        <th>Produit vendu</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                    {commande.produits.map((produit, index) => {
    const produitId = produit.produit._id; // Accès correct à l'ID du produit
    const quantiteDisponible = produit.quantite; // Récupération de la quantité disponible directement

    return (
        <tr key={index}>
            <td>{produit.produit.nom}</td>
            <td>{produit.quantite}</td>
            <td>{produit.prixUnitaire} Ariary</td>
            <td>
                <input
                    type="number"
                    className="form-control"
                    value={produitsVendus.find(p => p.produitId === produitId)?.quantite || 0} // Assurez-vous de gérer les valeurs undefined
                    onChange={(e) => handleQuantiteChange(produitId, quantiteDisponible, e)} // Passer la quantité disponible à la fonction
                />
            </td>
            <td>
                <button className="btnAO btn-info" onClick={handleValidation}>Valider</button>
            </td>
        </tr>
    );
})}

                    </tbody>
                  </table>
                </div>
                <h6 className="total">Montant restant: Ariary</h6>
                <h6 className="total">Total à payer: {calculerTotalApresRetour()} Ariary</h6>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default PaiementCom;
