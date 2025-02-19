import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; 
import "../Styles/Profile.css";
import Sidebar from "../Components/SidebarVendeur";
import Header from "../Components/NavbarV";

function HistoV() {
  const [commandes, setCommandes] = useState([]);
  const vendeurId = localStorage.getItem('userid'); // Assurez-vous que l'ID du vendeur est stocké dans le local storage

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/commandes/vendeur/${vendeurId}`);
        setCommandes(response.data);
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
      <header></header>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="profil-container p-4">
            <h2>Historique des Commandes</h2>
            {commandes.length === 0 ? (
              <p>Aucune commande trouvée pour ce vendeur.</p>
            ) : (
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
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default HistoV;
