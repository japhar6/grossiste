import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../api/axios';
import Swal from "sweetalert2"; 
import "../Styles/HistoC.css";
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";

function HistoC() {
  const [paiements, setPaiements] = useState({ clients: [], commerciaux: [] });
  const [filtreType, setFiltreType] = useState("both");
  const [date, setDate] = useState("");
  const [triMontant, setTriMontant] = useState("desc"); // État pour trier par montant
  const caissierId = localStorage.getItem("userid");
  const nom = localStorage.getItem('nom'); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const response = await axios.get(`/api/paiement/caissier/${caissierId}`);
        console.log(response.data);
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

    return allPaiements
      .filter(paiement => {
        const matchesType = filtreType === "both" || paiement.type === filtreType;
        const matchesDate = !date || new Date(paiement.createdAt).toLocaleDateString() === new Date(date).toLocaleDateString();
        return matchesType && matchesDate;
      })
      .sort((a, b) => 
        triMontant === "asc" ? a.montantPaye - b.montantPaye : b.montantPaye - a.montantPaye
      ); // Tri selon la sélection
  };

  const filteredPaiements = getFilteredPaiements();

  const handleFactureChange = (e, paiementId) => {
    const factureType = e.target.value;
    
    localStorage.setItem("paiementId", paiementId);
    
    if (factureType === "factureNormal") {
      navigate("/FactureNormal");
    } else if (factureType === "Remise") {
      navigate("/FactureRemise");
    }
  };

  return (
    <>
      <header></header>
      <main className="center">
        <Sidebar />
        <section className="contenue">  
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3">
              <h6 className="alert alert-info text-start">Historique des Paiements fait par {nom}</h6>

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

                <label>
                  Trier par montant:
                  <select className="form-select" value={triMontant} onChange={e => setTriMontant(e.target.value)}>
                  <option value="desc">Montant décroissant</option>
                  <option value="asc">Montant croissant</option></select>
                </label>
              </div>

              {filteredPaiements.length === 0 ? (
                <p>Aucun paiement trouvé.</p>
              ) : (
                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                  <table className="tableZA table-striped">
                    <thead className="table-light">
                      <tr>
                        <th>Reference Facture</th>
                        <th>{filtreType === "commercial" ? "Commercial" : "Client"}</th>
                        <th>Montant Payé</th>
                        <th>Statut</th>
                        <th>Date de payement</th>
                        <th>Facture</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPaiements.map((paiement) => (
                        <tr key={paiement._id}>
                          <td>{paiement.commandeId?.referenceFacture}</td>
                          <td>{paiement.type === "commercial" ? paiement.commercialNom : paiement.clientNom}</td>
                          <td>{paiement.montantPaye} ariary</td>
                          <td>{paiement.statut}</td>
                          <td>{new Date(paiement.createdAt).toLocaleDateString()}</td>
                          <td>
                            <select className="form-control" onChange={(e) => handleFactureChange(e, paiement._id)}>
                              <option>Selectionner la facture</option>
                              <option value="factureNormal">Facture normale</option>
                              <option value="Remise">Avec Remise</option>
                              <option value="">Sans prix</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default HistoC;
