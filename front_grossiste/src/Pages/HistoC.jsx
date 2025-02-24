import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../api/axios';
import Swal from "sweetalert2"; 
import "../Styles/HistoC.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";

function HistoC() {
    const [paiements, setPaiements] = useState({ clients: [], commerciaux: [] });
    const [filtreNomCaissier, setFiltreNomCaissier] = useState("");

  const [filtreType, setFiltreType] = useState("both");
  const [date, setDate] = useState("");
  const [triMontant, setTriMontant] = useState("desc"); // État pour trier par montant
    
  const caissierId = localStorage.getItem("userid");
  const nom = localStorage.getItem('nom'); 
  const [filtreModePaiement, setFiltreModePaiement] = useState("all");
  const [statutfilter, setstatufilter] = useState("all");
  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const response = await axios.get(`/api/paiement`);
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
        const matchesModePaiement = filtreModePaiement === "all" || (paiement.commandeId && paiement.commandeId.modePaiement === filtreModePaiement);
        const matchStatut = statutfilter === "all" || (paiement.statut === statutfilter);
        const matchesNomCaissier = !filtreNomCaissier || (paiement.idCaissier && paiement.idCaissier.nom.toLowerCase().includes(filtreNomCaissier.toLowerCase()));
    
        return matchesType && matchesDate && matchesModePaiement && matchStatut && matchesNomCaissier;
      })
      .sort((a, b) => 
        triMontant === "asc" ? a.montantPaye - b.montantPaye : b.montantPaye - a.montantPaye
      ); 
  };
  

  const filteredPaiements = getFilteredPaiements();

  return (
    <>
      <header></header>
      <main className="center">
        <Sidebar />
        <section className="contenue">  
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3">
              <h6 className="alert alert-info text-start">Historique des Paiements </h6>

              <div className="filter-container mb-3 d-flex flex-wrap justify-content-between gap-2">
  <div className="flex-fill">
    <label className="form-label w-100">
      <select className="form-select uniform-size" value={filtreType} onChange={e => setFiltreType(e.target.value)}>
        <option value="">Filtrer par type:</option>
        <option value="both">Les deux</option>
        <option value="client">Paiements Clients</option>
        <option value="commercial">Paiements Commerciaux</option>
      </select>
    </label>
  </div>

  <div className="flex-fill">
    <label className="form-label w-100">
      <input 
        type="date" 
        className="form-control uniform-size" 
        value={date} 
        onChange={e => setDate(e.target.value)} 
        placeholder="Filtrer par date"
      />
    </label>
  </div>

  <div className="flex-fill">
    <label className="form-label w-100">
      <select className="form-select uniform-size" value={triMontant} onChange={e => setTriMontant(e.target.value)}>
        <option value="">Trier par montant:</option>
        <option value="desc">Montant décroissant</option>
        <option value="asc">Montant croissant</option>
      </select>
    </label>
  </div>

  <div className="flex-fill">
    <label className="form-label w-100">
      <select className="form-select uniform-size" value={filtreModePaiement} onChange={e => setFiltreModePaiement(e.target.value)}>
        <option value="">Filtrer par mode de paiement:</option>
        <option value="all">Tous</option>
        <option value="espèce">Espèce</option>
        <option value="virement bancaire">Virement Bancaire</option>    
        <option value="mobile money">Mobile Money</option>
        <option value="à crédit">À Crédit</option>
      </select>
    </label>
  </div>

  <div className="flex-fill">
    <label className="form-label w-100">
      <select className="form-select uniform-size" value={statutfilter} onChange={e => setstatufilter(e.target.value)}>
        <option value="">Filtrer par statut:</option>
        <option value="all">Tous</option>
        <option value="payé complet">Payé Complet</option>
        <option value="payé partielle">Paiement Partielle</option>    
        <option value="Produits retourner">Produits retourner</option>
      </select>
    </label>
  </div>

  <div className="flex-fill">
    <label className="form-label w-100">
      <input 
        type="text" 
        className="form-control uniform-size" 
        value={filtreNomCaissier} 
        onChange={e => setFiltreNomCaissier(e.target.value)} 
        placeholder="Filtrer par nom de caissier:"
      />
    </label>
  </div>
</div>



              {filteredPaiements.length === 0 ? (
          <table className="tableZA table-striped">
          <thead className="table-light">
            <tr>
              <th>Reference Facture</th>
              <th>{filtreType === "commercial" ? "Commercial" : "Client"}</th>
              <th>Montant Payé</th>
              <th>Mode de payement</th>
              <th>Statut</th>
              <th>Date de paiement</th>
            </tr>
          </thead>
          <tbody>
          <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>Aucun paiement trouvé.</td>
            </tr>   </tbody>
        </table>
              ) : (
                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                  <table className="tableZA table-striped">
                    <thead className="table-light">
                      <tr>
                        <th>Reference Facture</th>
                        <th>{filtreType === "commercial" ? "Commercial" : "Client"}</th>
                        <th>Montant Payé</th>
                        <th>Mode de payement</th>
                        <th>Statut</th>
                        <th>Fait par :</th>
                        <th>Date de paiement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPaiements.map((paiement) => (
                        <tr key={paiement._id}>
                          <td>{paiement.commandeId?.referenceFacture}</td>
                          <td>{paiement.type === "commercial" ? paiement.commercialNom : paiement.clientNom}</td>
                          <td>{paiement.montantPaye} ariary</td>
                          <td>{paiement.commandeId ? paiement.commandeId.modePaiement : "Non spécifié"} </td>
                          <td>{paiement.statut}</td>
                          <td>{paiement.idCaissier && paiement.idCaissier.nom ? paiement.idCaissier.nom : "Non spécifié"}</td>

                          <td>{new Date(paiement.createdAt).toLocaleDateString()}</td>
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
