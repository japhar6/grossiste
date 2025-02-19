import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import "../Styles/Commade.css";

function Caisse() {
  const [referenceFacture, setReferenceFacture] = useState("");
  const [commande, setCommande] = useState(null);
  const [client, setClient] = useState(null);  // Nouvel état pour le client


  // Fonction pour rechercher la commande
  const handleSearch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/commandes/reference/${referenceFacture}`);
      if (!response.ok) {
        throw new Error("Commande non trouvée");
      }
      const data = await response.json();
      setCommande(data);
      setClient(data.clientId); 
    } catch (error) {
      console.error(error);
      setCommande(null);
      setClient(null);
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

            {/* Recherche de commande */}
            <div className="commande-container d-flex justify-content-between">
              <div className="client-info w-50 p-3">
                <h6><i className="fa fa-user"></i> Référence de la commande</h6>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Entrer la référence"
                    value={referenceFacture}
                    onChange={(e) => setReferenceFacture(e.target.value)}
                  />
                  <button className="btn btn-primary ms-2" onClick={handleSearch}>
                    Rechercher
                  </button>
                </div>
              </div>
              <div className="produits p-3">
                <h6><i className="fa fa-box"></i> Détails du paiement </h6>
                <table className="table mt-2">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Contact</th>
                      <th>Remise</th>
                      <th>Valeur</th>
                      <th>Mode de paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {/* Affichage des informations du client */}
                      <td>{client ? client.nom : ''}</td>
                      <td>{client ? client.telephone : ''}</td>
                      <td>
                        <select className="form-control">
                          <option value="aucune">Aucune</option>
                          <option value="produit">Par produit (%)</option>
                          <option value="total">Total (%)</option>
                          <option value="fixe">Fixe</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                        />
                      </td>
                      <td>
                        <select className="form-control">
                          <option value="cash">Cash</option>
                          <option value="mobile_money">Mobile Money</option>
                          <option value="credit">A crédit</option>
                          <option value="virement">Virement bancaire</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Affichage des détails de la commande */}
            {commande && (
              <div className="commande mt-4">
                <h6><i className="fa fa-receipt"></i> Récapitulatif de la Commande</h6>
                <table className="table table-bordered mt-2 text-center">
                  <thead>
                    <tr>
                      <th>Nom du produit</th>
                      <th>Quantité</th>
                      <th>Prix Unitaire</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commande.produits.map((produit, index) => (
                      <tr key={index}>
                        <td>{produit.produit.nom}</td>
                        <td>{produit.quantite}</td>
                        <td>{produit.prixUnitaire} Ariary</td>
                        <td>{produit.total} Ariary</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h6 className="total">
                  Total avant remise: {commande.totalAvantRemise} Ariary
                </h6>

                <h6 className="total">
                  Total après remise: {commande.totalApresRemise} Ariary
                </h6>

                <button className="btn btn-success mt-3">
                  Valider le paiement
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Caisse;
