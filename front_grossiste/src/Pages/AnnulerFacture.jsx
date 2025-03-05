import React, { useState, useEffect } from "react";
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";
import "../Styles/Caisse.css";
import Swal from "sweetalert2";
import axios from "../api/axios";
import Sound from "../assets/mixkit-clear-announce-tones-2861.wav";
import generateInvoice from "../config/generateInvoice";
import generateDiscountInvoice from "../config/generateCreditInvoice";
import { useNavigate } from "react-router-dom";

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
  const [loadingEntrepots, setLoadingEntrepots] = useState(false);
  const [loadingMagasiniers, setLoadingMagasiniers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

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
        const response = await axios.get('/api/commandes/toutfact');
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

  const handleSearch = async () => {setLoadingAction(true)
    try {
      const response = await axios.get(`/api/commandes/reference/${referenceFacture}`);


      // Vérifiez le statut de la réponse
      if (response.status !== 200) {
        throw new Error("Commande non trouvée");
      }
      setLoadingAction(false)
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
      setLoadingAction(false)
      // Optionnel : Vous pouvez également afficher un message d'erreur à l'utilisateur
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response && error.response.status === 404 ? "Référence non trouvée." : "Erreur lors de la recherche de la commande",
      });
    }
  };
  
  
  
  const annulerCommande = async () => {
    if (commande) {
      try {
        setLoadingAction(true);
        const response = await axios.post(`/api/commandes/annuler-commande/${referenceFacture}`);
  
        if (response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Commande annulée',
            text: `La commande ${referenceFacture} a été annulée avec succès.`,
          });
  
          setCommande(null); // Réinitialiser la commande après l'annulation
        }
      } catch (error) {
        console.error("Erreur lors de l'annulation de la commande :", error);
  
        // Vérification si l'erreur provient de la réponse du back-end (status code 400 ou 404 par exemple)
        let errorMessage = "Une erreur est survenue lors de l'annulation de la commande.";
  
        if (error.response) {
          // Si l'erreur provient d'une réponse du serveur
          const { status, data } = error.response;
          
          if (status === 400) {
            // Afficher un message spécifique pour le code 400
            errorMessage = data.message || "Mauvaise requête. Vérifiez les données envoyées.";
          } else if (status === 404) {
            // Afficher un message spécifique pour le code 404
            errorMessage = data.message || "Commande non trouvée.";
          }
          // Vous pouvez ajouter plus de conditions pour d'autres statuts d'erreur, comme 500, etc.
        }
  
        // Afficher l'erreur
        Swal.fire({
          icon: 'info',
          title: 'Erreur',
          text: errorMessage,
        });
      } finally {
        setLoadingAction(false);
      }
    }
  };
  
    
  

  



  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3">
          <h1 className="alert alert-success text-start" style={{ width: '100%' }}>
              <i className="fa fa-shopping-cart"></i> Annuler une commande
            </h1>

            <div className="commande-container d-flex justify-content-between">
              <div className="refcli ">
              <h6 className="gradient-text mb-3"><i className="fa fa-user"></i> Référence de la commande</h6>
                <div className="form-group ">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Entrer la référence"
                    value={referenceFacture}
                    onChange={handleInputChange} // Changez ici
                  />
                  {suggestions.length > 0 && (
                    <ul className="list-group" style={{ cursor: 'pointer' }}>
                      {suggestions.map((suggestion) => (
                        <li key={suggestion} className="list-group-item" style={{ marginTop: '-13px' }} onClick={() => handleSuggestionClick(suggestion)}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                 

                 



<button className="btno btn-success " disabled={loadingAction}  onClick={handleSearch}> 
{loadingAction ? (
                                          <div className="spinner-border style={{ width: '1rem !important', height: '1rem !important' }}" role="status">
                                              <span className="visually-hidden">Chargement...</span>
                                          </div>
                                      ) : (
                                          <span>
                                              <i className='fa fa-check-circle'></i> Rechercher
                                          </span>
                                      )}
                  </button>
                </div>

              </div>

              <div className="produits p-3">
              <h6 className="alert alert-info" style={{ width: '100%' }}><i className="fa fa-box"></i> Détails du paiement </h6>
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
            <div>
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
                        <td>{produit.quantite} {produit.uniteChoisie}</td>
                        <td>{produit.prixdevente} Ariary</td>
                        <td>{produit.total} Ariary</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h6 className="total">Total : {commande.totalGeneral} Ariary</h6>


                <button
  className="btnVA btn-success mt-3"
  onClick={() => {

 
    annulerCommande(); 
  }}
>
                  <i className="fa fa-check-circle"></i> Valider le paiement
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
