import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; 
import "../Styles/HistoC.css";
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";

function HistoC() {
  const [paiements, setPaiements] = useState({ clients: [], commerciaux: [] });
  const [filtreType, setFiltreType] = useState("both");
  const [date, setDate] = useState("");
  const caissierId = localStorage.getItem("userid");
  const nom = localStorage.getItem('nom'); 

  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/paiement/caissier/${caissierId}`);
        console.log(response.data); // Vérifiez la structure de la réponse
        setPaiements(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des paiements:", error);
        Swal.fire("Erreur", "Impossible de récupérer les paiements.", "error");
      }
    };

    fetchPaiements();
  }, [caissierId]);

  const getFilteredPaiements = () => {
    const allPaiements = [
      ...paiements.clients.map(client => ({
        ...client,
        type: "client",
      })),
      ...paiements.commerciaux.map(commercial => ({
        ...commercial,
        type: "commercial",
      })),
    ];

    return allPaiements.filter(paiement => {
      const matchesType = filtreType === "both" || paiement.type === filtreType;
      const matchesDate = !date || new Date(paiement.createdAt).toLocaleDateString() === new Date(date).toLocaleDateString();
      return matchesType && matchesDate;
    });
  };

  const filteredPaiements = getFilteredPaiements();

  return (
    <>
      <header></header>
      <main className="d-flex">
        <Sidebar />
        <section className="contenue flex-grow-1 p-4">
          <Header />
          <div className="histoC">
            <h2 className='alert alert-success'>Historique des Paiement fait par {nom}</h2>

            <div className="filter-container mb-3">
  <label>
    Filtrer par type:
    <select className="form-select" value={filtreType} onChange={e => setFiltreType(e.target.value)}>
      <option value="both">Les deux</option>
      <option value="client">Paiements Clients</option>
      <option value="commercial">Paiements Commerciaux</option>
    </select>
  </label>

  <label>
    Filtrer par date:
    <input 
      type="date" 
      className="form-control" 
      value={date} 
      onChange={e => setDate(e.target.value)} 
    />
  </label>
</div>


            {filteredPaiements.length === 0 ? (
              <p>Aucun paiement trouvé.</p>
            ) : (
              <table className="table table-striped">
                <thead className="table-light">
                  <tr>
                    <th>Reference Facture</th>
                    <th>{filtreType === "commercial" ? "Commercial" : "Client"}</th>
                    <th>Montant Payé</th>
                    <th>Statut</th>
                    <th>Date de payement</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaiements.map((paiement) => (
                    <tr key={paiement._id}>
                      <td>{paiement.commandeId?.referenceFacture}</td>
                      <td>{paiement.type === "commercial" ? paiement.commercialNom : paiement.clientNom}</td>
                      <td>{paiement.montantPaye} ariary</td>
                      <td>{paiement.statut}</td>
                      <td>{paiement.createdAt}</td>
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
