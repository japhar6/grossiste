import React from "react";
import "../Styles/SortieStock.css";

function SortieStock() {
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
            <option value="">terminée</option>
            <option value="">livrée</option>
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
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>
              <button
                className="btn btn-info"
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#DétailsCommande"
              >
                Voir Détails
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="modal fade" id="DétailsCommande">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold text-info">Détails de la commande</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
                <table className="table">
                    <thead>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Unité</th>
                        <th>Fournisseur</th>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Coca</td>
                            <td>10</td>
                            <td>Paquet</td>
                            <td>Habibo</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortieStock;
