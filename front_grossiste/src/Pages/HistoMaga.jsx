import React, { useState, useEffect } from "react";
import axios from '../api/axios';
import "../Styles/SortieStock.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Sound from "../assets/mixkit-clear-announce-tones-2861.wav"

function SortieStock() {
  const [commandes, setCommandes] = useState([]);
  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientType, setClientType] = useState("");
  const [statutCommande, setStatutCommande] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // État pour mobile
  const [sortOrder, setSortOrder] = useState("desc");

  const [vente, setVente] = useState(null);

  
  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await axios.get("/api/commandes/TermineeLivreeMaga");
        const sortedCommandes = response.data.sort((a, b) => {

          const dateA = new Date(a.dateCommande);
          const dateB = new Date(b.dateCommande);
          return dateB - dateA;  // Trier du plus récent au plus ancien
        });
        setCommandes(sortedCommandes);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes", error);
      }
    };
    fetchCommandes();
  }, []);
  


  

  // Effect pour suivre les changements de taille de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getDetailsCommande = async (commandeId) => {
    // Récupérer la commande sélectionnée
    const commande = commandes.find((c) => c._id === commandeId);
    setCommandeSelectionnee(commande);
    
    // Récupérer les informations de vente liées à cette commande
    try {
      const response = await axios.get(`/api/ventes/ventes/${commandeId}`);
      setVente(response.data[0]); // Supposons que la réponse est un tableau, prendre le premier élément
    } catch (error) {
      console.error("Erreur lors de la récupération des informations de vente", error);
    }
  };
  

// Filtrage des commandes
const filteredCommandes = commandes.filter((commande) => {
  const dateCommande = commande.updatedAt ? new Date(commande.updatedAt).toISOString().split("T")[0] : "";
  const clientNom = commande.clientId ? commande.clientId.nom : commande.commercialId ? commande.commercialId.nom : "N/A";

  const matchesSearchTerm = searchTerm === "" || (commande.referenceFacture && commande.referenceFacture.toLowerCase().includes(searchTerm.toLowerCase()));
  const matchesClientType = clientType === "" || (clientType === "client" && commande.clientId) || (clientType === "commercial" && commande.commercialId);
  const matchesStatutCommande = statutCommande === "" || commande.statut.toLowerCase() === statutCommande.toLowerCase();
  const matchesSearchDate = searchDate === "" || dateCommande === searchDate;

  return matchesSearchTerm && matchesClientType && matchesStatutCommande && matchesSearchDate;
});

// Tri des commandes par date
const sortedCommandes = filteredCommandes.sort((a, b) => {
  const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0); // Date par défaut au cas où
  const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0); // Date par défaut au cas où

  if (sortOrder === "asc") {
    return dateA - dateB; // Tri croissant
  } else {
    return dateB - dateA; // Tri décroissant
  }
});

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="sortie-stock-section mt-3">
          <h6>Historique des Sorties de stock</h6>
          <div className="filtrage bg-light p-2 mt-2">
  <h6 className="fw-bold">
    <i className="fa fa-search"></i> Filtrage
  </h6>
  <form className="center">
    <input 
      type="text" 
      className="form-control p-1 mt-2 m-1"  // Réduire le padding et la marge
      placeholder="Recherche de commande" 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    <select 
      className="form-control mt-2 m-1 p-1"  // Réduire le padding et la marge
      value={clientType} 
      onChange={(e) => setClientType(e.target.value)}
    >
      <option value="">Type de client</option>
      <option value="client">Client</option>
      <option value="commercial">Commercial</option>
    </select>
    
    <input 
      type="date" 
      className="form-control mt-2 m-1 p-1" // Réduire le padding et la marge
      value={searchDate} 
      onChange={(e) => setSearchDate(e.target.value)}
    />
  </form>
</div>
<div className="table-container" style={{ overflowX: 'hidden',overflowY:'auto' }}>
          <table className="tableMa table-striped mt-3">
            <thead>
              <tr>
              <th>{isMobile ? "Réf Fact" : "Référence facture"}</th>
                <th>Vendeur</th>
                <th>Client</th>
                <th>Mode de paiement</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommandes.map((commande) => (
                <tr key={commande._id}>
                  <td>{commande.referenceFacture}</td>
                  <td>{commande.vendeurId ? commande.vendeurId.nom : "N/A"}</td>
                  <td>{commande.clientId ? commande.clientId.nom : commande.commercialId ? commande.commercialId.nom : "N/A"}</td>
                  <td>{commande.paiement ? commande.paiement.modePaiement : "à crédit"}</td>
                  <td>{commande.statut}</td>
                  <td>{commande.updatedAt ? new Date(commande.updatedAt).toLocaleDateString() : "N/A"}</td>
                  <td>
  {isMobile ? (
    <button
      className="btn btn-info"
      type="button"
      data-bs-toggle="modal"
      data-bs-target="#DétailsCommande"
      onClick={() => getDetailsCommande(commande._id)}
    >
      <FontAwesomeIcon icon={faEye} />
    </button>
  ) : (
    <button
      className="btn btn-info"
      type="button"
      data-bs-toggle="modal"
      data-bs-target="#DétailsCommande"
      onClick={() => getDetailsCommande(commande._id)}
    >
      Voir Détails
    </button>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="modal fade" id="DétailsCommande" tabIndex="-1" aria-labelledby="DétailsCommandeLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered modal-md"> 

          <div className="modal-content">
  <div className="modal-header">
    <h5 className="modal-title fw-bold text-info" id="DétailsCommandeLabel">Détails de la commande</h5>
    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  </div>

  <div className="modal-body">
    {commandeSelectionnee ? (
      <>
        <div className="detail-item">
          <strong>{commandeSelectionnee.clientId ? "Client" : "Commercial"}: </strong>
          {commandeSelectionnee.clientId ? commandeSelectionnee.clientId.nom : commandeSelectionnee.commercialId ? commandeSelectionnee.commercialId.nom : "N/A"}
        </div>
        
        <div className="detail-item">
          <strong>Date de la commande: </strong> 
          {commandeSelectionnee.createdAt 
            ? new Date(commandeSelectionnee.createdAt).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
            : "N/A"
          }
        </div>

        <div className="detail-item">
          <strong>Date de Sortie: </strong> 
          {commandeSelectionnee.dateSortie 
            ? new Date(commandeSelectionnee.dateSortie).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
            : "N/A"
          }
        </div>

        <div className="detail-item">
          <strong>Type de Client: </strong>
          {commandeSelectionnee.clientId ? "Client" : commandeSelectionnee.commercialId ? "Commercial" : "N/A"}
        </div>

        {vente && (
          <>
            <div className="detail-item">
              <strong>Magasinier: </strong> {vente.magasinierId ? vente.magasinierId.nom : "N/A"}
            </div>

            <div className="detail-item">
              <strong>Entrepôt: </strong> {vente.entrepotId ? vente.entrepotId.nom : "N/A"}
            </div>
          </>
        )}

        <table className="modaltable">
          <thead>
            <tr>
              <th className="w-20">Produit</th>
              <th className="w-25">Quantité</th>
              <th className="w-25">Unité</th>
            </tr>
          </thead>
          <tbody>
            {commandeSelectionnee.produits.map((produit, index) => (
              <tr key={index}>
                <td className="w-50">{produit.produit ? produit.produit.nom : "N/A"}</td>
                <td className="w-25">{produit.quantite}</td>
                <td className="w-25">{produit.uniteChoisie ? produit.uniteChoisie : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ) : (
      <p>Aucune commande sélectionnée</p>
    )}
  </div>

  <div className="modal-footer text-center">
    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
  </div>
</div>

  </div>
</div>

        </div>
      </section>
    </main>
  );
}

export default SortieStock;
