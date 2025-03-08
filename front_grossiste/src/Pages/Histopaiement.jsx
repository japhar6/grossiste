import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../api/axios';
import Swal from "sweetalert2";
import "../Styles/HistoC.css";
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";
import { Link } from "react-router-dom";

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
        Swal.fire("Info", "Aucun paiement pour l'instant.", "info");
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
              <Link to='/annulerFact' >
                <button>Annuler une Commande</button>
              </Link>
              {filteredPaiements.length === 0 ? (
                <div className="alert alert-warning" role="alert">
                  <p>Aucun paiement trouvé.</p> </div>
              ) : (
                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                  <table className="tableZA table-striped">
                    <thead className="table-light">
                      <tr>
                        <th>Reference Facture</th>
                        <th>{filtreType === "commercial" ? "Commercial" : "Client"}</th>
                        <th>Montant Payé</th>
                        <th>Statut</th>  <th>Mode de paiement</th>
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
                          <td>
                            {paiement.modePaiement ? paiement.modePaiement : "Non spécifié"}
                            {paiement.modePaiement === "a credit" && paiement.dateLimiteCredit && (
                              <span style={{ color: "red", fontWeight: "bold" }}>
                                {" "} 📅 Échéance : {new Date(paiement.dateLimiteCredit).toLocaleDateString('fr-FR', {year: 'numeric',month: 'long',day: 'numeric',})}
                              </span>
                            )}
                            {["mobile money", "virement bancaire"].includes(paiement.modePaiement) && paiement.referencePaiement && (
                              <span style={{ color: "blue", fontWeight: "bold" }}>
                                {" "} 🔢 Réf : {paiement.referencePaiement}
                              </span>
                            )}
                          </td>
                          <td>{new Date(paiement.createdAt).toLocaleDateString('fr-FR', {year: 'numeric',month: 'long',day: 'numeric',})}</td>
                          
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
