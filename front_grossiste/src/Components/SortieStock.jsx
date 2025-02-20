import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/SortieStock.css";

function SortieStock() {
  const [commandes, setCommandes] = useState([]);
  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientType, setClientType] = useState("");
  const [statutCommande, setStatutCommande] = useState("");
  const [searchDate, setSearchDate] = useState("");

  
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
      alert("Veuillez sélectionner une commande à valider.");
      return;
    }
  
    // Récupération du magasinierId depuis le localStorage
    const magasinierId = localStorage.getItem("userid");
    if (!magasinierId) {
      alert("Magasinier non identifié.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/ventes/valider", {
        commandeId: commandeSelectionnee._id,
        magasinierId: magasinierId,
      });
  
      alert(response.data.message); // Affichage d'une notification de succès
      setCommandes(commandes.filter(cmd => cmd._id !== commandeSelectionnee._id)); // Mise à jour de la liste des commandes
      setCommandeSelectionnee(null); // Réinitialiser la sélection
    } catch (error) {
      console.error("Erreur lors de la validation de la vente:", error);
      alert("Échec de la validation de la vente.");
    }
  };
  

  // Filtrage des commandes
  const filteredCommandes = commandes.filter((commande) => {
    const dateCommande = commande.updatedAt ? new Date(commande.updatedAt).toISOString().split("T")[0] : "";
    const clientNom = commande.clientId ? commande.clientId.nom : commande.commercialId ? commande.commercialId.nom : "N/A";
    
    return (
      (searchTerm === "" || commande.referenceFacture.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (clientType === "" || (clientType === "client" && commande.clientId) || (clientType === "commercial" && commande.commercialId)) &&
      (statutCommande === "" || commande.statut.toLowerCase() === statutCommande.toLowerCase()) &&
      (searchDate === "" || dateCommande === searchDate)
    );
  });

  return (
    <div className="sortie-stock-section mt-3">
      <h6>Historique des Sorties de stock</h6>
      <div className="filtrage bg-light p-3 mt-3">
        <h6 className="fw-bold">
          <i className="fa fa-search"></i> Filtrage
        </h6>
        <form className="center">
          <input 
            type="text" 
            className="form-control p-2 mt-3 m-2" 
            placeholder="Recherche de commande" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="form-control mt-3 m-2 p-2" 
            value={clientType} 
            onChange={(e) => setClientType(e.target.value)}
          >
            <option value="">Type de client</option>
            <option value="client">Client</option>
            <option value="commercial">Commercial</option>
          </select>
          <select 
            className="form-control mt-3 m-2 p-2"
            value={statutCommande} 
            onChange={(e) => setStatutCommande(e.target.value)}
          >
            <option value="">Statut du commande</option>
            <option value="terminée">Terminée</option>
            <option value="livrée">Livrée</option>
          </select>
          <input 
            type="date" 
            className="form-control mt-3 m-2 p-2" 
            value={searchDate} 
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </form>
      </div>

      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Référence facture</th>
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
                <button
                  className="btn btn-info"
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target="#DétailsCommande"
                  onClick={() => getDetailsCommande(commande._id)}
                >
                  Voir Détails
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="modal fade" id="DétailsCommande" tabIndex="-1" aria-labelledby="DétailsCommandeLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold text-info" id="DétailsCommandeLabel">Détails de la commande</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {commandeSelectionnee ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Unité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commandeSelectionnee.produits.map((produit, index) => (
                    <tr key={index}>
                        <td>{produit.produit ? produit.produit.nom : "N/A"}</td>
                        <td>{produit.quantite}</td>
                        <td>{produit.produit ? produit.produit.unite : "N/A"}</td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucune commande sélectionnée</p>
              )}
            </div>
            <div className="modal-footer center">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
              <button className="btn btn-info" onClick={validerVente}>
  Valider la vente
</button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortieStock;
