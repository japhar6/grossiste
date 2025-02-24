import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../api/axios';
import Swal from "sweetalert2";
import "../Styles/Histov.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";

function HistoV() {
  const [commandes, setCommandes] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [modePaiementFilter, setModePaiementFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [filtreNomCaissier, setFiltreNomCaissier] = useState("");
  const vendeurId = localStorage.getItem('userid');

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await axios.get(`/commandes/`);
        console.log("Commandes récupérées :", response.data);

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

  // Filtrage des commandes
  const filteredCommandes = commandes.filter(commande => {
    const dateMatch = dateFilter ? new Date(commande.createdAt).toISOString().slice(0, 10) === dateFilter : true;
    const modePaiementMatch = modePaiementFilter ? commande.modePaiement === modePaiementFilter : true;
    const statutMatch = statutFilter ? commande.statut === statutFilter : true;
    const matchesNomCaissier = !filtreNomCaissier || 
      (commande.vendeurId && commande.vendeurId.nom && commande.vendeurId.nom.toLowerCase().includes(filtreNomCaissier.toLowerCase()));

    return dateMatch && modePaiementMatch && statutMatch && matchesNomCaissier;
  });

  return (
    <>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3">
              <h2 className='alert alert-success'>Historique des Commandes</h2>

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
                    <select 
                      className="form-control" 
                      onChange={(e) => setStatutFilter(e.target.value)} 
                      value={statutFilter}
                    >
                      <option value="">Tous les statuts</option>
                      <option value="en cours">En Cours</option>
                      <option value="en attente">En Attente</option>
                      <option value="livrée">Livrée</option>
                      <option value="terminée">Terminé</option>
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      Filtrer par nom de vendeur:
                      <input 
                        type="text" 
                        className="form-control" 
                        value={filtreNomCaissier} 
                        onChange={e => setFiltreNomCaissier(e.target.value)} 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {filteredCommandes.length === 0 ? (
                <p>Aucune commande trouvée pour ce vendeur.</p>
              ) : (
                <div className="scrollable-container">
                  <table className="table-striped">
                    <thead>
                      <tr>  
                        <th>Reference du Commande</th>
                        <th>Date de Commande</th>
                        <th>Produits</th>
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
          </div>    
        </section>
      </main>
    </>
  );
}

export default HistoV;
