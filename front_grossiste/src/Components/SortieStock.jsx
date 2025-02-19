import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/SortieStock.css";

function SortieStock() {
  // États pour stocker les commandes et le détail de la commande sélectionnée
  const [commandes, setCommandes] = useState([]);

  // Appel API pour récupérer les commandes avec les statuts "terminée" ou "livrée"
  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/commandes/TermineeLivree");
        setCommandes(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes", error);
      }
    };
    fetchCommandes();
  }, []);

  return (
    <div className="sortie-stock-section mt-3">
      <h6>Historique des Sorties de stock</h6>
      <div className="filtrage bg-light p-3 mt-3">
        <h6 className="fw-bold">
          <i className="fa fa-search"></i> Filtrage
        </h6>
        <form className="center">
          <input
            type="text"
            className="form-control p-2 mt-3 m-2"
            placeholder="Recherche de commande"
          />
          <select className="form-control mt-3 m-2 p-2">
            <option value="">Type de client</option>
            <option value="">Client</option>
            <option value="">Commercial</option>
          </select>
          <select className="form-control mt-3 m-2 p-2">
            <option value="">Statut du commande</option>
            <option value="terminée">terminée</option>
            <option value="livrée">livrée</option>
          </select>
          <input type="date" className="form-control mt-3 m-2 p-2" />
        </form>
      </div>

      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Réference facture</th>
            <th>Vendeur</th>
            <th>Client</th>
            <th>Mode de paiement</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Détails</th>
          </tr>
        </thead>
        <tbody>
          {commandes.map((commande) => (
            <tr key={commande._id}>
              <td>{commande.referenceFacture}</td>
              <td>{commande.vendeurId ? commande.vendeurId.nom : ""}</td>
              <td>{commande.clientId ? commande.clientId.nom : ""}</td>
              <td>{commande.modePaiement}</td>
              <td>{commande.statut}</td>
              <td>{new Date(commande.date).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-info"
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target="#DétailsCommande"
                  onClick={() => getDetailsCommande(commande._id)}
                >
                  Voir Détails
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="modal fade" id="DétailsCommande" tabIndex="-1" aria-labelledby="DétailsCommandeLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold text-info" id="DétailsCommandeLabel">Détails de la commande</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Unité</th>
                        <th>Fournisseur</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                    </tbody>
                  </table>
            </div>
            <div className="modal-footer center">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
              <button type="button" className="btn btn-info">Valider la sortie</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortieStock;
