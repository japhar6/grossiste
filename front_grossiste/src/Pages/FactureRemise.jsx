import React, { useEffect, useState } from "react";
import axios from "axios";
import '../Styles/Facture.css';

function FactureRemise() {
  const [facture, setFacture] = useState(null);
  const paiementId = localStorage.getItem("paiementId");

  useEffect(() => {
    const fetchFactureDetails = async () => {
      try {
        const response = await axios.get(`https://api.bazariko.duckdns.org/api/paiement/info/${paiementId}`);
        const paiement = response.data.clients.concat(response.data.commerciaux)
                          .find(p => p._id === paiementId); // Trouver le paiement qui correspond à l'ID
        setFacture(paiement);
      } catch (error) {
        console.error("Erreur lors de la récupération de la facture:", error);
      }
    };

    if (paiementId) {
      fetchFactureDetails();
    }
  }, [paiementId]);

  if (!facture) {
    return <p>Chargement des informations...</p>;
  }

  const isClient = facture.type === "client"; // Vérification du type de paiement
  // Calcul du total général
  const totalGeneral = facture.produits?.reduce((acc, produit) => {
    return acc + (produit.quantite * produit.prixUnitaire);
  }, 0);

  // Calcul du total après remise
  const totalRemise = facture.produits?.reduce((acc, produit) => {
    const remise = produit.remise ? produit.remise : 0; // Valeur de la remise, par défaut 0 si aucune remise
    const totalProduit = produit.quantite * produit.prixUnitaire;
    const totalAvecRemise = totalProduit - (totalProduit * remise / 100);
    return acc + totalAvecRemise;
  }, 0);

  // Fonction pour imprimer la page
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mt-5">
      <h2 className="facture-title text-center mb-4">Facture avec remise</h2>
      <div className="facture-info">
        <div className="row">
          <div className="col-md-6">
            <p><strong>Référence Commande :</strong> {facture.commandeId?.referenceFacture}</p>
            <p><strong>Type de client :</strong> {isClient ? "Client" : "Commercial"}</p>
            <p><strong>Type de remise :</strong> {facture.remiseType || "Aucune"}</p>
            <p><strong>Valeur de la remise :</strong> {facture.produits?.map(produit => produit.remise ? `${produit.remise} %` : "Aucune").join(", ")}</p>
          </div>
          <div className="col-md-6">
            <p><strong>Nom du client :</strong> {isClient ? facture.clientNom : facture.commercialNom}</p>
            <p><strong>Statut du paiement :</strong> {facture.statut}</p>
            <p><strong>Mode de paiement :</strong> {facture.modePaiement}</p>
          </div>
        </div>
      </div>

      <h3 className="produits-title mt-4 mb-3">Liste des Produits</h3>
      <table className="table table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Produit</th>
            <th>Quantité</th>
            <th>Prix Unitaire</th>
            <th>Remise (%)</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {facture.produits?.map((produit, index) => (
            <tr key={index}>
              <td>{produit.nom}</td>
              <td>{produit.quantite}</td>
              <td>{produit.prixUnitaire} ariary</td>
              <td>{produit.remise ? `${produit.remise} %` : 'Aucune'}</td>
              <td>{produit.quantite ? `${produit.quantite * produit.prixUnitaire - (produit.quantite * produit.prixUnitaire * (produit.remise || 0) / 100)} ariary` : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-end mt-3">
        <h4>Total avant remise : <span>{totalGeneral ? `${totalGeneral} ariary` : 'N/A'}</span></h4>
        <h4>Total après remise : <span>{totalRemise ? `${totalRemise} ariary` : 'N/A'}</span></h4>
      </div>

      {/* Bouton Imprimer */}
      <div className="d-flex justify-content-end mt-4">
        <button onClick={handlePrint} className="btn btn-primary">Imprimer</button>
      </div>
    </div>
  );
}

export default FactureRemise;
