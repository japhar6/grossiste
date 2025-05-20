import React, { useEffect, useState } from "react";
import "../Styles/Facture.css";
import Logo from "../assets/logoo.png";
import axios from "../api/axios";
function FactureSans() {
  const [commande, setCommande] = useState(null);
  const [modePaiement, setModePaiement] = useState(null);
  const [referencePaiement, setReferencePaiement] = useState(null);
  const [dateLimiteCredit, setDateLimiteCredit] = useState(null);
  const [client, setClient] = useState(null);
  const [commercial, setCommercial] = useState(null);

 
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const commandeId = queryParams.get("commandeId");
  
    if (!commandeId) {
      console.error("❌ Aucun commandeId trouvé dans l'URL");
      return;
    }
  
    async function fetchPaiement(id) {
      try {
        let response;
    
        try {
          // Première tentative : /paiement/recuperer/:id
          response = await axios.get(`/api/commandes/recuperer/${id}`);
          console.log("✅ Données récupérées depuis /paiement");
        } catch (error) {
          if (error.response && error.response.status === 404) {
           
            console.log("✅ Données récupérées depuis /paiementCom");
          } else {
            throw error; // autre erreur (réseau, 500, etc.)
          }
        }
    
        const data = response.data;
    
        // MàJ des états avec les données reçues
        setCommande(data);
        setModePaiement(queryParams.get("modePaiement"));
            setReferencePaiement(queryParams.get("referencePaiement"));
            setDateLimiteCredit(queryParams.get("dateLimiteCredit"));
            setClient(data.clientId);
            setCommercial(data.commercialId);
            setdatePositionnementCheque(queryParams.get("datePositionnementCheque"));
  
    
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du paiement :", error);
      }
    }
    
    fetchPaiement(commandeId);
  }, []);

  useEffect(() => {
    if (commande) {
      setTimeout(() => {
        window.print(); // Imprime après 2 secondes
        setTimeout(() => {
          window.close(); // Ferme l'onglet après l'impression
        }, 1000); // 1 seconde après impression
      }, 2000);
    }
  }, [commande]);

  if (!commande) {
    return <div>Chargement...</div>;
  }

  const clientOuCommercial = client || commercial;

  return (
    <div className="facture-container">
      <div className="facture-header">
        <img src={Logo} alt="Logo" width={100} />
        <div className="infoCompany">
                    <h3 style={{ fontWeight: "bold" }}>MAGASIN BAZARIKO</h3>
                    <h5 className="fw-bold">Distribution de Marchandises Générales</h5>
                    <h5 className="fw-bold">Tanambao II, TOAMASINA</h5>
                    <h5 className="fw-bold">+ 261 34 13 881 72</h5>
                </div>
      </div>
    
      <div className="facture-info p-3">
        <div style={{ float: "left" }}>
          <p>
            <strong>Date :</strong> {new Date().toLocaleDateString('fr-FR', {year: 'numeric',month: 'long',day: 'numeric',})}
          </p>
          <p>
            <strong>Client :</strong> {clientOuCommercial?.nom || "Non spécifié"}
          </p>
          <p>
            <strong>Adresse :</strong>{" "}
            {clientOuCommercial?.adresse || "..................."}
          </p>
          <p>
            <strong>Mode de paiement :</strong> {modePaiement || "............."}
          </p>
        </div>
        <div style={{ float: "right" ,marginTop:"-20px"}}>
          <h3>FACTURE</h3>
          <p>
            <strong>N° :</strong> {commande.referenceFacture}
          </p>
          <p>
            <strong>Date limite de paiement :</strong>{" "}
            {new Date(dateLimiteCredit).toLocaleDateString('fr-FR', {year: 'numeric',month: 'long',day: 'numeric',}) || "..........."}
          </p>
          <p>
            <strong>Référence :</strong> {referencePaiement || "..........."}
          </p>
        </div>
      </div>
 
      <div className="facture-details mt-4">
        <table className="table table-responsive table-bordered">
          <thead>
            <tr>
              <th>Qté</th>
              <th>Unité</th>
              <th>Désignation</th>
              <th>Entrepot</th>

            </tr>
          </thead>
          <tbody>
            {commande.produits.map((produit, index) => (
              <tr key={index}>
                <td>{produit.quantite}</td>
                <td>{produit.uniteChoisie || "unite"}</td>
                <td>{produit.produit.nom}</td>
                <td>{produit.entrepotId.nom}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>



      <div className="facture-footer">

        <p>Misaotra Tompoko</p>
        <div className="signature">
          <span>Le Client</span>
          <span>Magasin</span>
        </div>
      </div>
    </div>
  );
}

export default FactureSans;
