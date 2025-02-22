import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/SortieStock.css";
import Sidebar from "../Components/SidebarMagasinier"; // Assurez-vous que ces imports sont corrects
import Header from "../Components/NavbarM"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

function SortieStock() {
  const [commandes, setCommandes] = useState([]);
  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientType, setClientType] = useState("");
  const [statutCommande, setStatutCommande] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // État pour mobile

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/commandes/TermineeLivree");
        setCommandes(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes", error);
      }
    };
    fetchCommandes();
  }, []);

  const getDetailsCommande = (commandeId) => {
    const commande = commandes.find((c) => c._id === commandeId);
    setCommandeSelectionnee(commande);
  };

  const validerVente = async () => {
    if (!commandeSelectionnee) {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez sélectionner une commande à valider.',
      });
      return;
    }
  
    const magasinierId = localStorage.getItem("userid");
    if (!magasinierId) {
      Swal.fire({
        icon: 'warning',
        title: 'Erreur',
        text: 'Magasinier non identifié.',
      });
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/ventes/valider", {
        commandeId: commandeSelectionnee._id,
        magasinierId: magasinierId,
      });
  
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: response.data.message,
      });
      
      setCommandes(commandes.filter(cmd => cmd._id !== commandeSelectionnee._id));
      setCommandeSelectionnee(null);
    } catch (error) {
      console.error("Erreur lors de la validation de la vente:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Échec de la validation de la vente.',
      });
    }
  };

  // Effect pour suivre les changements de taille de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
// Filtrage des commandes
const filteredCommandes = commandes.filter((commande) => {
  const dateCommande = commande.updatedAt ? new Date(commande.updatedAt).toISOString().split("T")[0] : "";
  const clientNom = commande.clientId ? commande.clientId.nom : commande.commercialId ? commande.commercialId.nom : "N/A";
  


  return (
    (searchTerm === "" || (commande.referenceFacture && commande.referenceFacture.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (clientType === "" || (clientType === "client" && commande.clientId) || (clientType === "commercial" && commande.commercialId)) &&
    (statutCommande === "" || commande.statut.toLowerCase() === statutCommande.toLowerCase()) &&
    (searchDate === "" || dateCommande === searchDate)
  );
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
    <select 
      className="form-control mt-2 m-1 p-1" // Réduire le padding et la marge
      value={statutCommande} 
      onChange={(e) => setStatutCommande(e.target.value)}
    >
      <option value="">Statut du commande</option>
      <option value="terminée">Terminée</option>
      <option value="livrée">Livrée</option>
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
                  <td>{commande.modePaiement}</td>
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
     <p>
  <strong>{commandeSelectionnee.clientId ? "Client" : "Commercial"}:</strong> 
  {commandeSelectionnee.clientId ? commandeSelectionnee.clientId.nom : commandeSelectionnee.commercialId ? commandeSelectionnee.commercialId.nom : "N/A"}
</p>
 <p><strong>Date:</strong> {commandeSelectionnee.updatedAt ? new Date(commandeSelectionnee.updatedAt).toLocaleDateString() : "N/A"}</p>
      <p><strong>Type de Client:</strong> {commandeSelectionnee.clientId ? "Client" : commandeSelectionnee.commercialId ? "Commercial" : "N/A"}</p>
      <table className="modaltable ">
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
              <td className="w-25">{produit.produit ? produit.produit.unite : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  ) : (
    <p>Aucune commande sélectionnée</p>
  )}
</div>

<div className="modal-footer center">
  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
  {commandeSelectionnee && commandeSelectionnee.statut.toLowerCase() === "terminée" && ( // Affiche le bouton seulement si la commande est terminée
    <button className="btn btn-info" onClick={validerVente}>
      Valider la vente
    </button>
  )}
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
