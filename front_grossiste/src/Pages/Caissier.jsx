import React, { useState, useEffect } from "react";
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";
import "../Styles/Caisse.css";
import Swal from 'sweetalert2';
import axios from '../api/axios';
import Sound from "../assets/mixkit-clear-announce-tones-2861.wav";

function Caisse() {
  const [referenceFacture, setReferenceFacture] = useState("");
  const [commande, setCommande] = useState(null);
  const [client, setClient] = useState(null);
  const [commercial, setCommercial] = useState(null);
  const [allReferences, setAllReferences] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [modePaiement, setModePaiement] = useState("");
    const [dateLimiteCredit, setDateLimiteCredit] = useState("");
    const [referencePaiement, setReferencePaiement] = useState("");
   
    const handleChangeModePaiement = (e) => {
      setModePaiement(e.target.value);
    };

  const playSound = () => {
    const audio = new Audio(Sound); 
    audio.play();
  };


  const idCaissier = localStorage.getItem("userid"); 

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const response = await axios.get('/api/commandes/suggestions'); // Votre route pour récupérer toutes les références
        setAllReferences(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des références :", error);
      }
    };

    fetchReferences();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setReferenceFacture(value);

    if (value) {
      const filteredSuggestions = allReferences.filter(ref =>
        ref.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]); 
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setReferenceFacture(suggestion); // Mettez à jour l'input avec la suggestion choisie
    setSuggestions([]); // Réinitialisez les suggestions après la sélection
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/api/commandes/reference/${referenceFacture}`);

      // Vérifiez le statut de la réponse
      if (response.status !== 200) {
        throw new Error("Commande non trouvée");
      }

      const data = response.data;

      // Vérifiez le type de client
      if (data.typeClient === "Client") {
        setClient(data.clientId);
        setCommercial(null);
      } else if (data.typeClient === "Commercial") {
        setCommercial(data.commercialId);
        setClient(null);
      }

      setCommande(data);
     
    } catch (error) {
      console.error("Erreur lors de la recherche de la commande :", error);
      setCommande(null);
      setClient(null);
      setCommercial(null);
      // Optionnel : Vous pouvez également afficher un message d'erreur à l'utilisateur
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response && error.response.status === 404 ? "Référence non trouvée." : "Erreur lors de la recherche de la commande",
      });
    }
  };

  const validerPaiement = async () => {
    if (!commande) return;
  
// Si le type de client est "Commercial", définir le mode de paiement à "a credit" automatiquement
   


if (commande.typeClient === "Client" && !modePaiement) {
    Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: 'Veuillez sélectionner un mode de paiement.',
    });
    return;
}
  
  
    // Vérifier que la référence de paiement est remplie si nécessaire
    if ((modePaiement === "mobile money" || modePaiement === "virement bancaire") && !referencePaiement) {
      Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: modePaiement === "mobile money" ? 'Veuillez entrer la référence de la transaction.' : 'Veuillez entrer la référence du bordereau.',
      });
      return;
    }
  
    // Vérifier que la date limite est bien remplie si mode de paiement "à crédit"
    if (modePaiement === "a credit" && !dateLimiteCredit) {
      Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: 'Veuillez entrer une date limite pour le paiement à crédit.',
      });
      return;
    }
  
    if (commande.statut !== "en cours") {
      Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: 'Le paiement ne peut pas être validé car la commande est déjà payée.',
      });
      return;
    }
    let typeClient = commande.typeClient; console.log("type",typeClient);
  

  
  
    const data = {
      statut: typeClient === "Commercial" ? "non payé" : "payé complet",
      modePaiement: modePaiement, 
      totalPaye: commande.totalGeneral,
      referencePaiement,
      dateLimiteCredit: modePaiement === "a credit" ? dateLimiteCredit : null, 
      idCaissier
    };
  
    console.log("Données de paiement à envoyer:", data);
  
    try {
      let url = `/api/paiement/ajouter/${commande._id}`;
      if (commande.typeClient === "Commercial") {
        url = `/api/paiementCom/commercial/${commande._id}`;
      }
  
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (response.status !== 200) {
        throw new Error("Échec du paiement");
      }
  
      const result = response.data;
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: result.message,
      }).then(() => {
        window.location.reload();
      });
      playSound();
      setReferencePaiement("");
      setDateLimiteCredit("");
      setCommande(null);
      setClient(null);
      setCommercial(null);
   
  
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || "Une erreur s'est produite lors du paiement.",
      });
    }
  };
  
  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3">
            <h6 className="alert alert-info text-start">
              <i className="fa fa-shopping-cart"></i> Caisse
            </h6>

            <div className="commande-container d-flex justify-content-between">
              <div className="refcli ">
                <h6><i className="fa fa-user"></i> Référence de la commande</h6>
                <div className="form-group ">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Entrer la référence"
                    value={referenceFacture}
                    onChange={handleInputChange} // Changez ici
                  />
                  {suggestions.length > 0 && (
                    <ul className="suggestions-list">
                      {suggestions.map((suggestion) => (
                        <li key={suggestion} onClick={() => handleSuggestionClick(suggestion)}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                    <select
  className="form-control mt-2"
  value={modePaiement}
  onChange={(e) => setModePaiement(e.target.value)}
>
  <option value="">Sélectionner le mode de paiement</option>
  <option value="espèce">Espèce</option>
  <option value="mobile money">Mobile Money</option>
  <option value="a credit">A Crédit</option>
  <option value="virement bancaire">Virement bancaire</option>
</select>

                  {(modePaiement === "mobile money" || modePaiement === "virement bancaire") && (
  <div className="form-group mt-3">
    <label htmlFor="referencePaiement">
      {modePaiement === "mobile money" ? "Référence de la transaction" : "Référence du bordereau"}
    </label>
    <input
      type="text"
      id="referencePaiement"
      className="form-control"
      placeholder="Entrez la référence de la facture"
      value={referencePaiement}
      onChange={(e) => setReferencePaiement(e.target.value)}
    />
  </div>
)}
{modePaiement === "a credit" && (
  <div className="form-group">
    <label htmlFor="dateLimiteCredit">Date limite de paiement</label>
    <input
      type="date"
      id="dateLimiteCredit"
      className="form-control"
      value={dateLimiteCredit}
      onChange={(e) => setDateLimiteCredit(e.target.value)}
      required
    />
  </div>
)}




                  <button className="btno btn-primary " onClick={handleSearch}>
                    Rechercher
                  </button>
                </div>
            
              </div>

              <div className="produits p-3">
                <h6><i className="fa fa-box"></i> Détails du paiement </h6>
                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                  <table className="tableCS mt-2">
                    <thead>
                      <tr>
                        <th>{commande ? (commande.typeClient === "Commercial" ? "Commercial" : "Client") : "Client"}</th>
                        <th>Contact</th>
                      
                        
                        <th>Mode de paiement</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{commande?.typeClient === "Commercial" ? commercial?.nom : client?.nom}</td>
                        <td>{commande?.typeClient === "Commercial" ? commercial?.telephone : client?.telephone}</td>
                      
                      
                        <td>{modePaiement || "Non spécifié"}</td>

                      </tr>
                    </tbody>
                  </table>
                </div>
             
              </div>
            </div>

            {commande && (
              <div className="commandeX mt-4">
                <h6><i className="fa fa-receipt"></i> Récapitulatif de la Commande</h6>
                <table className="tableCS table-bordered mt-2 text-center">
                  <thead>
                    <tr>
                      <th>Nom du produit</th>
                      <th>Quantité</th>
                      <th>Prix Unitaire</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commande.produits.map((produit, index) => (
                      <tr key={index}>
                        <td>{produit.produit.nom}</td>
                        <td>{produit.quantite}</td>
                        <td>{produit.prixdevente} Ariary</td>
                        <td>{produit.total} Ariary</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h6 className="total">Total : {commande.totalGeneral} Ariary</h6>
             

                <button className="btnVA btn-success mt-3" onClick={validerPaiement}>
                  Valider le paiement
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Caisse;
