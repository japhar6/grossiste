import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "../Styles/Histov.css"; // Assurez-vous que le chemin est correct
import Sidebar from "../Components/SidebarVendeur";
import Header from "../Components/NavbarV";

function HistoV() {
  const [commandes, setCommandes] = useState([]);
  const vendeurId = localStorage.getItem('userid');
  const nom = localStorage.getItem('nom'); 

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/commandes/vendeur/${vendeurId}`);
        // Trier les commandes par date décroissante (les plus récentes en premier)
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

  return (
    <>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="profil-container p-4">
            <h2 className='alert alert-success'>Historique des Commandes faites par {nom}</h2>
            {commandes.length === 0 ? (
              <p>Aucune commande trouvée pour ce vendeur.</p>
            ) : (
              // Conteneur pour permettre le défilement horizontal
              <div className="scrollable-container">
                <table className="table-striped">
                  <thead>
                    <tr>
                      <th>Date de Commande</th>
                      <th>Produits</th>
                      <th>Mode de Paiement</th>
                      <th>Statut</th>
                      <th>Montant Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commandes.map((commande) => (
                      <tr key={commande._id}>
                        <td>{new Date(commande.createdAt).toLocaleDateString()}</td>
                        <td>
                          <table className="table">
                            <thead>
                              <tr>
                                <th>Nom du Produit</th>
                                <th>Quantité</th>
                                <th>Prix Unitaire</th>
                              </tr>
                            </thead>
                            <tbody>
                              {commande.produits.map((produit) => (
                                <tr key={produit._id}>
                                  <td>{produit.produit.nom}</td>
                                  <td>{produit.quantite}</td>
                                  <td>{produit.prixUnitaire} ariary</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                        <td>{commande.modePaiement}</td>
                        <td>{commande.statut}</td>
                        <td>{commande.totalGeneral} ariary</td>
                      </tr>
                    ))}
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
