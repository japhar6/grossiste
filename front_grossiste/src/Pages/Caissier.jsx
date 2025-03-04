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
  const [nomEntrepot, setNomentrepot] = useState(null);
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
        const response = await axios.get('/api/commandes/suggestions');
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

const nomEntrepot = response.data.entrepotId.nom;

setNomentrepot(nomEntrepot);
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
  const validerPaiement = async () => {
    if (!commande) return false;
  
    // Si le type de client est "Commercial", définir le mode de paiement à "a credit" automatiquement
    if (commande.typeClient === "Client" && !modePaiement) {
      Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: 'Veuillez sélectionner un mode de paiement.',
      });
      return false;
    }
  
    // Vérifier que la référence de paiement est remplie si nécessaire
    if ((modePaiement === "mobile money" || modePaiement === "virement bancaire") && !referencePaiement) {
      Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: modePaiement === "mobile money" ? 'Veuillez entrer la référence de la transaction.' : 'Veuillez entrer la référence du bordereau.',
      });
      return false;
    }
  
    // Vérifier que la date limite est bien remplie si mode de paiement "à crédit"
    if (modePaiement === "a credit" && !dateLimiteCredit) {
      Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: 'Veuillez entrer une date limite pour le paiement à crédit.',
      });
      return false;
    }
  
    if (commande.statut !== "en cours") {
      Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: 'Le paiement ne peut pas être validé car la commande est déjà payée.',
      });
      return false;
    }
  
    const data = {
      statut: commande.typeClient === "Commercial" ? "non payé" : "payé complet",
      modePaiement,
      totalPaye: commande.totalGeneral,
      referencePaiement,
      dateLimiteCredit: modePaiement === "a credit" ? dateLimiteCredit : null,
      idCaissier,
    };
  
    try {
      let url = `/api/paiement/ajouter/${commande._id}`;
      if (commande.typeClient === "Commercial") {
        url = `/api/paiementCom/commercial/${commande._id}`;
      }
  
      const response = await axios.post(url, data, {
        headers: { "Content-Type": "application/json" },
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
        window.location.reload(); // Recharger la page après avoir cliqué sur OK
      });
      
      playSound();
      setReferencePaiement("");
      setDateLimiteCredit("");
      setCommande(null);
      setClient(null);
      setCommercial(null);
  
      return true;  // Retourner `true` pour indiquer que le paiement a été validé avec succès
  
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.message || "Une erreur s'est produite lors du paiement.",
      });
      return false;  // Retourner `false` en cas d'échec
    }
  };
  
    const navigate = useNavigate();
    const handleGenerateInvoice = async () => {
      const { value: typeFacture, isDismissed } = await Swal.fire({
        title: "🧾 Sélectionnez le type de facture",
        html: `
          <div style="text-align: left;">
            <label>
              <input type="checkbox" name="typeFacture" value="normal" style="margin-right: 8px;"> 📜 Facture Normale
            </label>
            <br>
            <label>
              <input type="checkbox" name="typeFacture" value="remise" style="margin-right: 8px;"> 📜 Facture de Remise
            </label>
               <label>
              <input type="checkbox" name="typeFacture" value="sans_prix" style="margin-right: 8px;"> 📜 Facture sans prix
            </label>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "✅ Valider",
        cancelButtonText: "❌ Annuler",
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#d33",
        preConfirm: () => {
          const selectedTypes = Array.from(document.querySelectorAll('input[name="typeFacture"]:checked')).map(input => input.value);
          if (selectedTypes.length === 0) {
            Swal.showValidationMessage("⚠️ Vous devez sélectionner au moins un type de facture !");
            return false;
          }
          return selectedTypes;
        }
      });
    
      if (isDismissed || !typeFacture) {
        console.log("Annulation de la génération de facture.");
        return;
      }
    
      const paiementValidationResult = await validerPaiement();
    
      if (paiementValidationResult) {
        const queryParams = new URLSearchParams();
        if (commande) queryParams.set("commande", JSON.stringify(commande));
        if (modePaiement) queryParams.set("modePaiement", modePaiement);
        if (referencePaiement) queryParams.set("referencePaiement", referencePaiement);
        if (dateLimiteCredit) queryParams.set("dateLimiteCredit", dateLimiteCredit);
        if (nomEntrepot) queryParams.set("nomEntrepot", nomEntrepot);
        if (client) {
          queryParams.set("client", JSON.stringify(client));
        } else if (commercial) {
          queryParams.set("commercial", JSON.stringify(commercial));
        }
    
        // Utiliser des noms uniques pour les fenêtres
        const openInvoices = () => {
          if (typeFacture.includes("normal")) {
            const factureUrlNormal = `/facture?${queryParams.toString()}`;
            window.open(factureUrlNormal, "factureNormal");
          }
    
          if (typeFacture.includes("remise")) {
            const factureUrlRemise = `/FactureRemise?${queryParams.toString()}`;
            window.open(factureUrlRemise, "factureRemise");
          }
          if (typeFacture.includes("sans_prix")) {
            const factureUrlRemise = `/facturesansprix?${queryParams.toString()}`;
            window.open(factureUrlRemise, "facturesansprix");
          }
        };
    
        openInvoices();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: "Le paiement n'a pas été validé.",
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
          <h1 className="alert alert-success text-start" style={{ width: '100%' }}>
              <i className="fa fa-shopping-cart"></i> Caisse
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
                        <th>Nom de l'entrepot</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{commande?.typeClient === "Commercial" ? commercial?.nom : client?.nom}</td>
                        <td>{commande?.typeClient === "Commercial" ? commercial?.telephone : client?.telephone}</td>


                        <td>{modePaiement || "Non spécifié"}</td>
                        <td>{ nomEntrepot || "Non spécifié" }</td>

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

    handleGenerateInvoice();
   // validerPaiement(); 
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
