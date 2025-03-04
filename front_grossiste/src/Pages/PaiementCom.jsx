import React, { useState, useEffect } from "react";
import Sidebar from "../Components/SidebarCaisse";
import Header from "../Components/NavbarC";
import "../Styles/Caisse.css";
import Swal from "sweetalert2";
import Sound from "../assets/mixkit-clear-announce-tones-2861.wav";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

function PaiementCom() {
  const [referenceFacture, setReferenceFacture] = useState("");
  const [commande, setCommande] = useState(null);
  const [commercial, setCommercial] = useState(null);
  const [produitsRetournes, setProduitsRetournes] = useState({});
  const [produitsVendus, setProduitsVendus] = useState([]);
  const [allReferences, setAllReferences] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [produitsMisesAJour, setProduitsMisesAJour] = useState([]);
  const [prixVente, setPrixVente] = useState(0);
  const [quantiteVendue, setQuantiteVendue] = useState('');
  const [unites, setUnites] = useState([]);
  const [nomunite, setnomunite] = useState("");
  const [quantity, setQuantity] = useState('');
  const [unitesParProduit, setUnitesParProduit] = useState({});  // On gère un objet pour les unités par produit
    const [modePaiement, setModePaiement] = useState("");
  const [referencePaiement, setReferencePaiement] = useState("");
  
  const playSound = () => {
    const audio = new Audio(Sound);
    audio.play();
  };

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        const response = await axios.get("/api/paiementCom/credit");
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
      const filteredSuggestions = allReferences.filter((ref) =>
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
    if (!referenceFacture) return; // Validation si la référence est vide

    try {
      const response = await axios.get(`/api/commandes/reference/${referenceFacture}`);

      if (response.status !== 200) throw new Error("Commande non trouvée");

      const data = response.data;

      if (data.typeClient === "Commercial") {
        setCommercial(data.commercialId);
      } else {
        Swal.fire({
          icon: "warning",
          title: "Alerte",
          text: "Seules les références de facture de type commercial peuvent être traitées ici.",
        });
        setCommande(null);
        setCommercial(null);
        return;
      }

      setCommande(data);
      setProduitsRetournes({});
      setProduitsVendus([]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response && error.response.status === 404 ? "Référence non trouvée." : "Erreur lors de la recherche de la commande",
      });
      setCommande(null);
      setCommercial(null);
    }
  };

  useEffect(() => {
    if (commande?.produits?.length > 0) {
      commande.produits.forEach(produit => {
        if (produit.produit._id) {
          fetchUnites(produit.produit._id);
        }
      });
    }
  }, [commande]);
  
  const fetchUnites = async (id) => {
    try {
      const response = await axios.get(`/api/produits/recuperer/${id}`);
      setUnitesParProduit(prevState => ({
        ...prevState,
        [id]: response.data.unites || []
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des unités:', error);
      setUnitesParProduit(prevState => ({
        ...prevState,
        [id]: [] // Réinitialise en cas d'erreur
      }));
    }
  };
  console.log("Prix de vente sélectionné:", nomunite);
  
 
  
  const handleValidation = async () => {
    let montantTotalVendu = 0;

    // Construire le tableau produitsVendus
    const produitsVendus = produitsMisesAJour
      .filter(produit => {
        // Vérifier si la quantité est valide et que prixVente est bien défini
        const prixVente = parseFloat(produit.prixVente); // Convertir en nombre
        const isValid = produit.quantite > 0 && !isNaN(prixVente) && prixVente > 0;
     
        console.log(`Quantité du produit ${produit.produitId}: ${produit.quantite}`);
        console.log(`Valeur de prixVente: ${prixVente}`);
        console.log(`Produit ${produit.produitId} validé: ${isValid}`);

        if (!isValid) {
          console.warn(`Produit ignoré : ${JSON.stringify(produit)}`);
        }
        return isValid;  
      })
      .map(produit => {
        console.log("Commande produits:", JSON.stringify(commande.produits, null, 2));

        // Recherche du produit dans la commande
        const produitCommande = commande.produits.find(item => item.produit._id.toString() === produit.produitId.toString());

        if (produitCommande) {
          const prixVente = parseFloat(produit.prixVente);
          const montantProduit = prixVente * produit.quantite;
          montantTotalVendu += montantProduit;

          console.log(`Produit ajouté : ${JSON.stringify(produit)}`);

          return {
            produitId: produit.produitId,
            quantite: produit.quantite,
            prixVente: prixVente,
            uniteVendu: produit.uniteVendu
          };
        } else {
          console.warn(`Produit avec ID ${produit.produitId} non trouvé dans la commande.`);
          return null;
         
        }
      })
      .filter(produit => produit !== null);  

    if (produitsVendus.length === 0) {
      console.warn("Aucun produit valide à mettre à jour.");
      return false;;
    }

    console.log("Données envoyées à l'API:", JSON.stringify({ produitsVendus }, null, 2));

    try {
      const response = await axios.put(`/api/paiementCom/mettre-ajour/${referenceFacture}`, {
        produitsVendus,modePaiement,referencePaiement,
      });

      Swal.fire("Succès", "Paiement mis à jour avec succès.", "success")
        .then(() => {
        
           window.location.reload();
        });
        return true; 
    } catch (error) {  
      console.error("Erreur lors de la mise à jour du paiement:", error.response?.data || error.message);
      Swal.fire("Erreur", error.response?.data?.message || "Une erreur est survenue lors de la mise à jour du paiement.", "error");
  
      return false; 
    }
};



const handleQuantiteChange = (e, produitId) => {
  const updatedQuantite = e.target.value;

  // Vérifie si la valeur est un nombre valide
  const parsedQuantite = updatedQuantite ? parseInt(updatedQuantite, 10) : 0;

  if (!produitId) {
    console.error("Produit ID manquant");
    return;
  }

  // Met à jour l'état de la quantité
  setQuantity(parsedQuantite);

  // Met à jour la liste des produits avec la nouvelle quantité
  setProduitsMisesAJour(prevState => {
    const produitExist = prevState.find(produit => produit.produitId === produitId);

    if (produitExist) {
      return prevState.map(produit =>
        produit.produitId === produitId
          ? { ...produit, quantite: parsedQuantite }
          : produit
      );
    } else {
      return [...prevState, { produitId, quantite: parsedQuantite }];
    }
  });
};

const handlePrixVenteChange = (e, produitId) => {
  const updatedPrixVente = e.target.value;
  setnomunite(updatedPrixVente);
  console.log("Produit sélectionné:", produitId);
  
  
  const unitesProduit = unitesParProduit[produitId] || [];
  const selectedUnite = unitesProduit.find(unite => unite.prixdevente === parseFloat(updatedPrixVente));
  const uniteName = selectedUnite ? selectedUnite.nom : "";

  console.log("Unité trouvée:", selectedUnite);
  console.log("Nom de l'unité:", uniteName);

  setProduitsMisesAJour(prevState => {
    const updatedProduits = prevState.map(produit => {
      if (produit.produitId === produitId) {
        console.log("Mise à jour du produit:", produitId);
        return { ...produit, prixVente: updatedPrixVente, uniteVendu: uniteName };
      }
      return produit;
    });

    console.log("Produits mis à jour:", updatedProduits);
    return updatedProduits;
  });
};


const handleGenerateInvoice = async () => {
  const paiementValidationResult = await handleValidation();

  if (paiementValidationResult) {
      const factureUrl = "/facturepaiement";
      const queryParams = new URLSearchParams();

      // Construire une nouvelle commande avec les produits mis à jour
      const commandeMiseAJour = {
          ...commande,
          produits: commande.produits.map(produit => {
              const miseAJour = produitsMisesAJour.find(p => p.produitId === produit.produit._id) || {};
              return {
                  ...produit,
                  quantite: miseAJour.quantite || produit.quantite,  
                  prixdevente: miseAJour.prixVente || produit.prixdevente, // Prend le prix sélectionné
                  uniteChoisie: miseAJour.uniteVendu || produit.uniteChoisie, // Prend l'unité choisie
                  total: (miseAJour.quantite || produit.quantite) * (miseAJour.prixVente || produit.prixdevente) // Recalcule le total
              };
          }),
          totalGeneral: commande.produits.reduce((total, produit) => {
              const miseAJour = produitsMisesAJour.find(p => p.produitId === produit.produit._id) || {};
              const quantite = miseAJour.quantite || produit.quantite;
              const prix = miseAJour.prixVente || produit.prixdevente;
              return total + quantite * prix;
          }, 0)
      };

      queryParams.set("commande", JSON.stringify(commandeMiseAJour));
      if (modePaiement) queryParams.set("modePaiement", modePaiement);
      if (referencePaiement) queryParams.set("referencePaiement", referencePaiement);
      if (commercial) queryParams.set("commercial", JSON.stringify(commercial));

      const factureWindow = window.open(`${factureUrl}?${queryParams.toString()}`, "_blank");

      if (factureWindow) {
          factureWindow.focus();
      }
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
            <h6 className="alert alert-info text-start">
              <i className="fa fa-shopping-cart"></i> Caisse
            </h6>
            <div className="commande-container d-flex justify-content-between">
              <div className="refcli">
                <h6><i className="fa fa-user"></i> Référence de la commande du commercial</h6>
                <div className="form-group ">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Entrer la référence"
                    value={referenceFacture}
                    onChange={handleInputChange}
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
                  <button className="btno btn-primary" onClick={handleSearch}>
                    Rechercher
                  </button>
                </div>
              </div>
              <div className="produits p-3">
                <h6><i className="fa fa-box"></i> Détails du paiement</h6>
                <table className="tableCS mt-2">
                  <thead>
                    <tr>
                      <th>Commercial</th>
                      <th>Contact</th>
                      <th>Mode de paiement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{commercial?.nom}</td>
                      <td>{commercial?.telephone}</td>
                      <td>{commande?.modePaiement || ""}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {commande && (
              <div className="commandeX mt-4">
                <h6><i className="fa fa-receipt"></i> Récapitulatif de la Commande</h6>
                <div className="table-container" style={{ overflowX: "auto", overflowY: "auto" }}>
                  <table className="table tableCS table-bordered mt-2 text-center">
                    <thead>
                      <tr>
                        <th>Nom du produit</th>
                        <th>Quantité</th>
                        <th>Prix Unitaire</th>
                        <th>Unité dans Commande</th>
                        <th>Quantité vendu</th>
                        <th>Unité vendu</th>
                      </tr>
                    </thead>
                    <tbody>
  {commande.produits.map((produit, index) => {
    if (!produit.produit._id) { 
      console.error("Produit ID manquant pour le produit", produit);
      return null; // Ignore ce produit s'il n'a pas d'ID
    }

    const produitMiseAJour = produitsMisesAJour.find(p => p.produitId === produit.produit._id) || {};

    return (
      <tr key={index}>
        <td>{produit.produit.nom}</td>
        <td>{produit.quantite}</td>
        <td>{produit.prixdevente} Ariary</td>
        <td>{produit.uniteChoisie || "N/A"}</td>
        <td>
          <input
            type="number"
            value={produitMiseAJour.quantite || 0}
            onChange={(e) => handleQuantiteChange(e, produit.produit._id)}
            placeholder="Quantité vendue"
            className="form-control"
          />
        </td>
        <td>
  <select
    className="form-select form-select-sm"
    value={produitMiseAJour.prixVente || ""}
    onChange={(e) => handlePrixVenteChange(e, produit.produit._id)}
  >
    <option value="">Sélectionner unité</option>
    {unitesParProduit[produit.produit._id]?.length > 0 ? (
      unitesParProduit[produit.produit._id].map((unite, index) => (
        <option key={index} value={unite.prixdevente}>
          {unite.nom} (Prix: {unite.prixdevente} Ariary)
        </option>
      ))
    ) : (
      <option disabled>Aucune unité disponible</option>
    )}
  </select>
 
</td>

      </tr>
    );
  })}
</tbody>


                  </table>
                </div>
              </div>
            )}
            <div className="montant-total">
             
              <select
                    className="form-control mt-2"
                    value={modePaiement}
                    onChange={(e) => setModePaiement(e.target.value)}
                  >
                    <option value="">Sélectionner le mode de paiement</option>
                    <option value="espèce">Espèce</option>
                    <option value="mobile money">Mobile Money</option>
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

            </div>
            <button className="btn btn-info w-50" onClick={handleGenerateInvoice }>
              Valider
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PaiementCom;
