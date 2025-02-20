import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; 
import "../Styles/Profile.css";
import Sidebar from "../Components/SidebarMagasinier";
import Header from "../Components/NavbarM";

function HistoC() {
  const [paiements, setPaiements] = useState({ clients: [], commerciaux: [] });
  const caissierId = localStorage.getItem("userid");

  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/paiement/caissier/${caissierId}`);
        setPaiements(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des paiements:", error);
        Swal.fire("Erreur", "Impossible de récupérer les paiements.", "error");
      }
    };

    fetchPaiements();
  }, [caissierId]);

  return (
    <>
      <header></header>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="profil-container p-4">
            <h2>Paiements Clients</h2>
            {paiements.clients.length === 0 ? (
              <p>Aucun paiement trouvé pour les clients.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Reference Facture</th>
                    <th>Client</th>
                    <th>Montant Payé</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {paiements.clients.map((paiement) => (
                    <tr key={paiement._id}>
                      <td>{paiement.commandeId.referenceFacture}</td>
                      <td>{paiement.clientNom}</td>
                      <td>{paiement.montantPaye} ariary</td>
                      <td>{paiement.statut}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h2>Paiements Commerciaux</h2>
            {paiements.commerciaux.length === 0 ? (
              <p>Aucun paiement trouvé pour les commerciaux.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Commande ID</th>
                    <th>Commercial</th>
                    <th>Montant Payé</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {paiements.commerciaux.map((paiement) => (
                    <tr key={paiement._id}>
                      <td>{paiement.commandeId.referenceFacture}</td>
                      <td>{paiement.commercialNom}</td>
                      <td>{paiement.montantPaye} ariary</td>
                      <td>{paiement.statuts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default HistoC;
