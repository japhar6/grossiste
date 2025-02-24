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
  
  const playSound = () => {
    const audio = new Audio(Sound); 
    audio.play();
  };

  const [typeRemise, setTypeRemise] = useState("aucune");
  const [valeurRemise, setValeurRemise] = useState(0);
  const [totalApresRemise, setTotalApresRemise] = useState(0);
  const idCaissier = localStorage.getItem("userid"); 

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const response = await axios.get('/commandes/suggestions'); // Votre route pour récupérer toutes les références
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
      setSuggestions([]); // Réinitialisez les suggestions si l'input est vide
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setReferenceFacture(suggestion); // Mettez à jour l'input avec la suggestion choisie
    setSuggestions([]); // Réinitialisez les suggestions après la sélection
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/commandes/reference/${referenceFacture}`);

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
      setTotalApresRemise(data.totalGeneral);
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

  const calculerRemise = () => {
    if (!commande) return;

    let totalFinal = commande.totalGeneral;

    if (typeRemise === "total" && valeurRemise > 0) {
      totalFinal -= totalFinal * (valeurRemise / 100);
    } else if (typeRemise === "fixe" && valeurRemise > 0) {
      totalFinal -= valeurRemise;
    } else if (typeRemise === "produit") {
      totalFinal = commande.produits.reduce((total, produit) => {
        const remiseProduit = (produit.prixUnitaire * (valeurRemise / 100)) * produit.quantite;
        return total + (produit.total - remiseProduit);
      }, 0);
    }

    setTotalApresRemise(Math.max(totalFinal, 0));
  };

  const validerPaiement = async () => {
    if (!commande) return;
  
    console.log("Statut de la commande:", commande.statut); // Vérification du statut
  
    if (commande.statut !== "en cours") {
      Swal.fire({
        icon: 'warning',
        title: 'Alerte',
        text: 'Le paiement ne peut pas être validé car la commande est déjà payée.',
      });
      return; // Arrête la fonction si le statut n'est pas "en cours"
    }
    const data = {
      statut: commande.typeClient === "Commercial" ? "non payé" : "payé complet", // Changer le statut selon le type de client
    
      remiseGlobale: typeRemise === "total" ? valeurRemise : 0,
      remiseFixe: typeRemise === "fixe" ? valeurRemise : 0,
      remiseParProduit:
        typeRemise === "produit"
          ? commande.produits.map((produit) => ({
              produitId: produit.produit._id,
              remise: valeurRemise,
            }))
          : [],
      totalPaye: totalApresRemise,
      idCaissier
    };
  
    console.log("Données de paiement à envoyer:", data); // Vérification des données
  
    try {
      let url = `/paiement/ajouter/${commande._id}`;
      if (commande.typeClient === "Commercial") {
        url = `/paiementCom/commercial/${commande._id}`;
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
      setReferenceFacture("");
      setCommande(null);
      setClient(null);
      setCommercial(null);
      setTypeRemise("aucune");
      setValeurRemise(0);
      setTotalApresRemise(0);
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
                        <th>Remise</th>
                        <th>Valeur</th>
                        <th>Mode de paiement</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{commande?.typeClient === "Commercial" ? commercial?.nom : client?.nom}</td>
                        <td>{commande?.typeClient === "Commercial" ? commercial?.telephone : client?.telephone}</td>
                        <td>
                          <select className="form-control" value={typeRemise} onChange={(e) => setTypeRemise(e.target.value)}>
                            <option value="aucune">Aucune</option>
                            <option value="produit">Par produit (%)</option>
                            <option value="total">Total (%)</option>
                            <option value="fixe">Fixe</option>
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={valeurRemise}
                            onChange={(e) => setValeurRemise(parseFloat(e.target.value))}
                          />
                        </td>
                        <td>{commande ? commande.modePaiement : ""}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button className="btna btn-secondary mt-2" onClick={calculerRemise}>
                  Appliquer Remise
                </button>
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
                        <td>{produit.prixUnitaire} Ariary</td>
                        <td>{produit.total} Ariary</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <h6 className="total">Total avant remise: {commande.totalGeneral} Ariary</h6>
                <h6 className="total">Total après remise: {totalApresRemise} Ariary</h6>

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
