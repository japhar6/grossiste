import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../api/axios';
import Swal from "sweetalert2";
import "../Styles/Histov.css"; // Assurez-vous que le chemin est correct
import Sidebar from "../Components/SidebarVendeur";
import Header from "../Components/NavbarV";

function HistoV() {
  const [commandes, setCommandes] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [modePaiementFilter, setModePaiementFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const vendeurId = localStorage.getItem('userid');
  const nom = localStorage.getItem('nom'); 
  const [triMontant, setTriMontant] = useState("desc");
  const [commissions, setCommissions] = useState([]);
  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await axios.get(`/api/commandes/vendeur/${vendeurId}`);
        const sortedCommandes = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCommandes(sortedCommandes);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
        Swal.fire({
          title: 'Erreur',
          text: "Impossible de récupérer les commandes.",
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    };

    fetchCommandes();
  }, [vendeurId]);

  const filteredCommandes = commandes.filter(commande => {
    const dateMatch = dateFilter ? new Date(commande.createdAt).toISOString().slice(0, 10) === dateFilter : true;
    const modePaiementMatch = modePaiementFilter ? commande.modePaiement === modePaiementFilter : true;
    const statutMatch = statutFilter ? commande.statut === statutFilter : true;

    return dateMatch && modePaiementMatch && statutMatch;
  })
  .sort((a, b) => 
    triMontant === "asc" ? a.totalGeneral - b.totalGeneral : b.totalGeneral - a.totalGeneral
  ); 
  

  return (
    <>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="profil-container p-4">
            <h6 className="alert alert-info text-start">Historique des Commandes faites par {nom}</h6>

            {/* Filtres */}
            <div className="filters mb-4">
  <div className="row">
    <div className="col-md-4 mb-3">
      <input
        type="date"
        className="form-control"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        placeholder="Filtrer par date"
      />
    </div>
    <div className="col-md-4 mb-3">
      <select 
        className="form-control" 
        onChange={(e) => setModePaiementFilter(e.target.value)} 
        value={modePaiementFilter}
      >
        <option value="">Tous les modes de paiement</option>
        <option value="virement bancaire">Virement Bancaire</option>
        <option value="espèce">Espèces</option>
        <option value="mobile money">Mobile Money</option>
        <option value="à crédit">A crédit</option>
      </select>
    </div>
    <div className="col-md-4 mb-3">
                  <label>
                  <select className="form-select" value="" onChange={e => setTriMontant(e.target.value)}>
                  <option value="">Trier par montant:</option>
                    <option value="desc">Montant décroissant</option>
                    <option value="asc">Montant croissant</option>
                  </select>
                </label>
                  </div>
    <div className="col-md-4 mb-3">
      <select 
        className="form-control" 
        onChange={(e) => setStatutFilter(e.target.value)} 
        value={statutFilter}
      >
        <option value="">Tous les statuts</option>
        <option value="en cours">En Cours</option>

                      <option value="payé">Les commande Payé</option>
                      <option value="payé et livrée">Livrée</option>
      </select>
    </div>
  </div>
</div>


            {filteredCommandes.length === 0 ? (
               <table className="table-striped">
               <thead>
                 <tr>  
                   <th>Reference du Commande</th>
                   <th>Date de Commande</th>
                   <th>Produits</th>
                   <th>Nom du client/commerciale</th>
                   <th>Mode de Paiement</th>
                   
                   <th>Statut</th>
                   <th>Fait par :</th>
                   <th>Montant Total</th>
                 </tr>
               </thead>
               <tbody>
               </tbody>    <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>Aucunne commande trouvé.</td>
            </tr>     </table>
           
            ) : (
              <div className="scrollable-container">
                 <table className="table-striped">
                    <thead>
                      <tr>  
                        <th>Reference du Commande</th>
                        <th>Date de Commande</th>
                        <th>Produits</th>
                        <th>Nom du client/commerciale</th>
                        <th>Mode de Paiement</th>
                        
                        <th>Statut</th>
                        <th>Fait par :</th>
                        <th>Montant Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCommandes.map((commande) => {
                        console.log("Commande analysée :", commande); // Debug

                        return (
                          <tr key={commande._id}>
                            <td>{commande.referenceFacture}</td>
                            <td>{new Date(commande.createdAt).toLocaleDateString()}</td>
                            <td>
                              <ul className="produit-list">
                                {commande.produits.map((produit) => (
                                  <li key={produit._id}>
                                    {produit.produit.nom} - {produit.quantite} x {produit.prixUnitaire} ariary
                                  </li>
                                ))}
                              </ul>
                            </td>      
                            <td>{commande.clientId ? commande.clientId.nom : (commande.commercialId ? commande.commercialId.nom : "Inconnu")}</td>

                            <td>{commande.modePaiement}</td>
                            <td>{commande.statut}</td>
                            <td>
                              {commande.vendeurId && commande.vendeurId.nom
                                ? commande.vendeurId.nom
                                : "Inconnu"}
                            </td>
                            <td>{commande.totalGeneral} ariary</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
               

              </div>
              
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default HistoV;
