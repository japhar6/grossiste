import React, { useState,useEffect } from "react";
import "../Styles/Achat.css";
import Sidebar from "../Components/Sidebar";
import axios from '../api/axios';
import Header from "../Components/Navbar";
import Swal from "sweetalert2";
import Select from 'react-select'; 
import HistoriqueAchats from "../Components/HistoriqueAchats";



function AchatProduits() {
  const [fournisseur, setFournisseur] = useState("");
  const [fournisseurs, setFournisseurs] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [entrepot, setEntrepot] = useState([]);
  const [panier, setPanier] = useState([]);
  const [panierCreer, setPanierCreer] = useState(false);
  const [produit, setProduit] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [historiqueAchats, setHistoriqueAchats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [nouvelleCategorie, setNouvelleCategorie] = useState(""); 
  const [ajouterCategorie, setAjouterCategorie] = useState(false); 
const [panierId, setPanierId] = useState(null); 
const [fourID, setFourID] = useState(null); 
const [achats, setAchats] = useState([]);
  const [typeFiltre, setTypeFiltre] = useState("");
  const [dateFiltre, setDateFiltre] = useState("");
  const [nouveauProduit, setNouveauProduit] = useState({ nom: "", categorie: "" ,description :"",prixDachat: "",unite:"",fournisseur: fourID});
  const [afficherFormulaireProduit, setAfficherFormulaireProduit] = useState(false);
  const [produitId, setProduitId] = useState(""); 
  const [fournisseurInfo, setFournisseurInfo] = useState(null);

  const [pourcentageManuel, setPourcentageManuel] = useState(0); 


  const handleFournisseurChange = (e) => {
    const selectedFournisseurId = e.target.value;
    setFournisseur(selectedFournisseurId);
    setFourID(selectedFournisseurId);
    console.log("id du fournisseur ", selectedFournisseurId);

    // Trouver les informations du fournisseur sélectionné
    const selectedFournisseur = fournisseurs.find(item => item._id === selectedFournisseurId);
    setFournisseurInfo(selectedFournisseur); // Mettre à jour l'état avec les informations du fournisseur

    setNouveauProduit({ ...nouveauProduit, fournisseur: selectedFournisseurId });
};
const quantiteNumerique = Number(quantite); // Assure-toi que quantite est un nombre
const produitsOfferts = fournisseurInfo && fournisseurInfo.type === "ristourne" 
    ? fournisseurInfo.conditions.typeRistourne === "par_produit" 
        ? Math.floor((quantiteNumerique * pourcentageManuel) / 100) // Utilise le pourcentage manuel
        : Math.floor((quantiteNumerique * fournisseurInfo.conditions.ristourne) / 100) 
    : 0;


const quantiteTotale = quantiteNumerique + produitsOfferts; // Utiliser quantiteNumerique ici

  


const handleProduitChange = async (selectedOption) => {
    if (!selectedOption) return; 
    if (selectedOption.value === 'add-new-product') {
        // Logique pour afficher le formulaire pour ajouter un nouveau produit
        setAfficherFormulaireProduit(true);
        return;
    }

    const produitId = selectedOption.value; // Récupérer l'ID du produit
    console.log("produit", produitId);
    if (!produitId) {
        console.error("ID du produit manquant");
        return;
    }
    
    setProduitId(produitId);
    // Mettre à jour le produit sélectionné
    setProduit(selectedOption);

    try {
        // Faire une requête pour récupérer les détails du produit avec Axios
        const response = await axios.get(`/api/produits/recuperer/${produitId}`);
        
        if (response.data) {
            setPrixAchat(response.data.prixDachat); // Mettre à jour le prix d'achat
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du produit:", error);
        setPrixAchat(""); // Réinitialiser en cas d'erreur
    }
};


useEffect(() => {
  const fetchCategories = async () => {
      try {
          const response = await axios.get('/api/produits/categories');
          setCategories(response.data); // Mettre à jour l'état avec les données récupérées
      } catch (error) {
          console.error("Erreur lors de la récupération des catégories", error);
      }
  };

  fetchCategories();
}, []);

  const [produitsOptions, setProduitsOptions] = useState([]);


  const handleAjoutProduit = async (e) => {
      e.preventDefault();
  
      // Ajouter la nouvelle catégorie si nécessaire
      const categorieFinale = ajouterCategorie ? nouvelleCategorie : nouveauProduit.categorie;
  
      const produit = {
          ...nouveauProduit,
          categorie: categorieFinale,
          prixDachat: parseFloat(nouveauProduit.prixDachat),
          fournisseur: fourID,
      };
      console.log("produit", produit);
  
      try {
          // Envoi du produit à l'API pour ajout avec Axios
          const response = await axios.post("/api/produits/ajouter", produit);
          
          Swal.fire({
              icon: 'success',
              title: 'Produit ajouté avec succès',
              showConfirmButton: true,
              timer: 2000 // Optionnel, pour fermer l'alerte après 2 secondes
          });
  
          // Réinitialiser le formulaire ici
          setNouveauProduit({
              nom: "",
              description: "",
              prixDachat: "",
              unite: "",
              quantiteMinimum: "",
          });
          setNouvelleCategorie("");
          setAjouterCategorie(false);
          setAfficherFormulaireProduit(false);
  
          // Récupérer les produits du fournisseur
          if (fournisseur) {
              const produitsResponse = await axios.get(`/api/produits/fournisseur/${fournisseur}`);
              const data = produitsResponse.data;
            
  
              if (Array.isArray(data) && data.length > 0) {
                  const options = data.map((produit) => ({
                      label: `${produit.nom} - ${produit.categorie}`,  // Afficher nom et catégorie
                      value: produit._id,  // Utiliser l'ID comme valeur
                  }));
                  
                  setProduitsOptions(options);
              } else {
                  setProduitsOptions([]);
                  Swal.fire({
                      title: "Erreur",
                      text: "Ce fournisseur n'a pas encore de produit.",
                      icon: "error",
                      confirmButtonText: "OK",
                  });
              }
          }
      } catch (error) {
          Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Une erreur est survenue lors de l\'ajout du produit',
          });
          console.error(error);
      }
  };
  
  
  
  
  const handleCategorieChange = (e) => {
    const selectedCategorie = e.target.value;
    setNouveauProduit({ ...nouveauProduit, categorie: selectedCategorie });

    if (selectedCategorie === "ajouter") {
      setAjouterCategorie(true);
    } else {
      setAjouterCategorie(false);
    }
  };

  const fetchAchats = async () => {
    try {
        const response = await axios.get(`/api/achats/panier/${panierId}`);
        const data = response.data;

        // Vérification du statut de la réponse
        if (response.status !== 200) {
            throw new Error(data.message || "Erreur lors de la récupération des achats.");
        }

        setAchats(data.achats);
    } catch (error) {
        console.error("Erreur lors de la récupération des achats :", error);

        // Vérifiez si error.response existe pour obtenir des détails supplémentaires
        const errorMessage = error.response ? error.response.data.message : "Une erreur est survenue.";

        Swal.fire({
            title: "Erreur",
            text: errorMessage,
            icon: "error",
            confirmButtonText: "OK",
        });
    }
};


  
  useEffect(() => {
    if (fournisseur) {
        const fetchProduits = async () => {
            try {
                const response = await axios.get(`/api/produits/fournisseur/${fournisseur}`);
                const data = response.data;

                if (Array.isArray(data) && data.length > 0) {
                    const options = data.map((produit) => ({
                        label: `${produit.nom} - ${produit.categorie}`,
                        value: produit._id,
                    }));
                    setProduitsOptions(options);
                } else {
                    // Si la réponse est valide mais qu'il n'y a pas de produits
                    setProduitsOptions([]);
                    Swal.fire({
                        title: "Erreur",
                        text: "Ce fournisseur n'a pas encore de produit.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            } catch (error) {
                // Vérifie si l'erreur provient d'une réponse 404
                if (error.response && error.response.status === 404) {
                    Swal.fire({
                        title: "Erreur",
                        text: "Fournisseur non trouvé ou aucun produit disponible.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                } else {
                    // Gérer d'autres types d'erreurs ici
                    Swal.fire({
                        title: "Erreur",
                        text: "Une erreur est survenue lors de la récupération des produits.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
                setProduitsOptions([]);
                console.error("Erreur lors de la récupération des produits:", error);
            }
        };

        fetchProduits(); // Appeler la fonction asynchrone pour récupérer les produits
    } else {
        setProduitsOptions([]);
    }
}, [fournisseur]);


  


  useEffect(() => {
    const fetchFournisseurs = async () => {
        try {
            const response = await axios.get("/api/fournisseurs/tous");
            const data = response.data;

            if (Array.isArray(data) && data.length > 0) {
                setFournisseurs(data);
            } else {
                Swal.fire({
                    title: "Erreur",
                    text: "Impossible de récupérer les fournisseurs.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Erreur",
                text: "Une erreur est survenue lors de la récupération des fournisseurs.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    fetchFournisseurs();
}, []);

  
  
  useEffect(() => {
        const fetchEntrepots = async () => {
            try {
                const response = await axios.get("/api/entrepot");
                const data = response.data;

                if (Array.isArray(data) && data.length > 0) {
                    setEntrepots(data);
                } else {
                    Swal.fire({
                        title: "Erreur",
                        text: "Impossible de récupérer les entrepôts.",
                        icon: "error",
                        confirmButtonText: "OK",
                    });
                }
            } catch (error) {
                Swal.fire({
                    title: "Erreur",
                    text: "Une erreur est survenue lors de la récupération des entrepôts.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        };

        fetchEntrepots();
    }, []);
  
  
  const handleEntrepotChange = (e) => {
    const selectedEntrepot = e.target.value;  
    setEntrepot(selectedEntrepot);  
    console.log("lid de lentreopt",selectedEntrepot);
   
  };
  const creerNouveauPanier = async () => {
  
    const panierData = {
      fournisseur,
      produits: panier,
    };
  
    try {
      const response = await axios.post("/api/paniers/ajouter", panierData);
  
      const data =  response.data;
      console.log("Réponse API complète :", data);
  
      if (data?.message === "Panier créé avec succès" && data.panier?._id) {
        setPanierId(data.panier._id);
        setPanierCreer(true);
        setPanier([]);
        setFournisseur("");
  
        Swal.fire({
          title: "Succès",
          text: "Votre panier a été créé avec succès !",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        throw new Error(data.message || "Impossible de créer le panier.");
      }
    } catch (error) {
      console.error("Erreur lors de la requête :", error);
      Swal.fire({
        title: "Erreur",
        text: error.message || "Une erreur est survenue lors de la création du panier.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  const ajouterAuPanier = async () => {
    const quantiteNumerique = Number(quantite);

    // Vérification que la quantité est un nombre valide
    if (isNaN(quantiteNumerique) || quantiteNumerique <= 0) {
        Swal.fire({
            title: "Erreur",
            text: "La quantité doit être un nombre valide et supérieur à 0.",
            icon: "warning",
            confirmButtonText: "OK",
        });
        return;
    }

    console.log("ID du panier avant envoi :", panierId);

    const achatData = {
        fournisseur: fournisseur,
        panierId: panierId,
        produit: produitId,
        quantite: quantiteNumerique,
        prixAchat: prixAchat,
        dateAchat: new Date().toISOString(),
        ristourneAppliquee: pourcentageManuel,
    };

    try {
        const response = await axios.post("/api/achats/ajouter", achatData);
        const data = response.data;

        // Vérifier si la réponse contient un achat
        if (data.achat) {
            console.log("Données envoyées pour création de l'achat :", data);

            // Afficher les produits offerts si disponible
            if (data.achat.produitsOfferts > 0) {
                Swal.fire({
                    title: "Succès",
                    text: `Achat ajouté avec succès. 🎁 Vous avez reçu ${data.achat.produitsOfferts} produits offerts !`,
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } else {
                Swal.fire({
                    title: "Succès",
                    text: "Achat ajouté avec succès.",
                    icon: "success",
                    confirmButtonText: "OK",
                });
            }

            fetchAchats();

            // Réinitialisation des champs après succès
            setFournisseur("");
            setQuantite("");
            setPrixAchat("");
            setProduit("");
        } else {
            throw new Error("Erreur lors de la création de l'achat");
        }

    } catch (error) {
        console.error("Erreur lors de la création de l'achat :", error);
        // Affichage des détails de l'erreur si disponibles
        if (error.response) {
            Swal.fire({
                title: "Erreur",
                text: error.response.data.message || "Une erreur est survenue.",
                icon: "error",
                confirmButtonText: "OK",
            });
        } else {
            Swal.fire({
                title: "Erreur",
                text: error.message || "Une erreur est survenue.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    }
};



const validerPanier = async () => {
  try {
      const response = await axios.post(`/api/achats/valider/${panierId}`, {
          entrepotId: entrepot, // Envoie des données ici
      });

      const data = response.data;

      // Vérifier le statut de la réponse
      if (response.status !== 200) {
          throw new Error(data.message || "Erreur lors de la validation de l'achat");
      }

      // Afficher une alerte de succès
      Swal.fire({
          title: "Panier validé",
          text: "Votre achat a été effectué avec succès. Les produits sont stockés dans l'entrepôt choisi.",
          icon: "success",
          confirmButtonText: "OK",
      }).then(() => {
          // Mettre à jour l'historique des achats
          const achat = {
              fournisseur,
              date: new Date().toLocaleString(),
              total: panier.reduce((acc, item) => acc + item.total, 0),
              produits: panier,
          };

          // Ajouter l'achat à l'historique
          setHistoriqueAchats([achat, ...historiqueAchats]);
          // Réinitialiser le panier et le fournisseur
          setPanierCreer(false);
          setFournisseur("");
          setPanier([]);
      });
  } catch (error) {
      console.error("Erreur lors de la validation de l'achat :", error);
      // Afficher un message d'erreur
      Swal.fire({
          title: "Erreur",
          text: error.response ? error.response.data.message : "Une erreur est survenue.",
          icon: "error",
          confirmButtonText: "OK",
      });
  }
};


  const filteredHistorique = historiqueAchats.filter((achat) => {
    const matchesFournisseur = achat.fournisseur.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFiltre ? achat.produits.some((p) => p.type === typeFiltre) : true;
    const matchesDate = dateFiltre ? achat.date.includes(dateFiltre) : true;
    return matchesFournisseur && matchesType && matchesDate;
  });




  const getFilteredAndSortedProducts = () => {
    const filteredProducts = nomsProduits.filter((product) =>
      product.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

  
    return filteredProducts.sort((a, b) => {
      const matchA = a.nom.toLowerCase().startsWith(searchTerm.toLowerCase()) ? 0 : 1;
      const matchB = b.nom.toLowerCase().startsWith(searchTerm.toLowerCase()) ? 0 : 1;
      return matchA - matchB;
    });
  };



  const customNoOptionMessage = (
    <button
      className="btn btn-link mt-1"
      onClick={() => setAfficherFormulaireProduit(true)}
    >
      Ajouter un Nouveau Produit
    </button>
  );
  const produitsOptionsWithAddOption = [
    ...produitsOptions,
    { label: 'Ajouter un Nouveau Produit', value: 'add-new-product' } 
];



    
  

  return (
    <>
      <header></header>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3">
              <h6 className="alert alert-success">
                <i className="fa fa-shopping-cart"></i> Achat Fournisseur
              </h6>
              {!panierCreer && (
                <div className="filtrage bg-light p-3 mt-3">
              <button className="btn btn-success btn-lg" onClick={creerNouveauPanier}>
  Créer un Nouveau Panier
</button>

                </div>
              )}

              {!panierCreer && (
                <HistoriqueAchats
                  historiqueAchats={historiqueAchats}
                  searchTerm={searchTerm}
                  typeFiltre={typeFiltre}
                  dateFiltre={dateFiltre}
                />
              )}

              {panierCreer && (
                <div className="achat-container">
             <div className="fournisseur-section">
    <h6><i className="fa fa-truck"></i> Sélection du Fournisseur</h6>
    <select
        className="form-control mt-3"
        value={fournisseur}
        onChange={handleFournisseurChange}
    >
        <option value="">Choisir un fournisseur</option>
        {fournisseurs.map((fournisseurItem) => (
            <option key={fournisseurItem._id} value={fournisseurItem._id}>
                {fournisseurItem.nom}
            </option>
        ))}
    </select>

    {fournisseurInfo && (
        <div className="fournisseur-info mt-3">
            {fournisseurInfo.type === "ristourne" ? (
                <>
                    <p className="alert alert-info">Fournisseur avec ristourne disponible</p>
                    <p>
                        Type de Ristourne : <strong>{fournisseurInfo.conditions.typeRistourne === "par_produit" ? "Ristourne par produit" : fournisseurInfo.conditions.typeRistourne === "générale" ? "Ristourne Générale" : fournisseurInfo.conditions.typeRistourne}</strong>
                    </p>

                    {fournisseurInfo.conditions.typeRistourne === "par_produit" && (
                        <div className="input-pourcentage">
                            <label>Pourcentage de Ristourne Manuelle :</label>
                            <input
    type="number"
    className="form-control mt-2 small-input" // Ajoute une classe CSS personnalisée
    value={pourcentageManuel}
    onChange={(e) => setPourcentageManuel(Number(e.target.value))}
    placeholder="%"
/>

                        </div>
                    )}

                    {fournisseurInfo.conditions.ristourne > 0 && (
                        <p>Pourcentage de Ristourne : <strong>{fournisseurInfo.conditions.ristourne} %</strong></p>
                    )}

                    {quantiteNumerique > 0 && (
                        <>
                            <p>Quantité achetée : <strong>{quantiteNumerique}</strong></p>
                            <p>Produits offerts : <strong>{produitsOfferts}</strong></p>
                            <p>Quantité totale : <strong>{quantiteTotale}</strong></p>
                        </>
                    )}
                </>
            ) : (
                <p className="alert alert-warning">Fournisseur sans ristourne</p>
            )}
        </div>
    )}
</div>


                  {/* Formulaire d'ajout de produit visible après avoir cliqué sur "Ajouter un Nouveau Produit" */}
                  {afficherFormulaireProduit ? (
                    <div className="produit-section mt-3">
                      <h6><i className="fa fa-box"></i> Ajouter un Nouveau Produit</h6>
                      <input
                        type="text"
                        className="form-control mt-2"
                        placeholder="Nom du produit"
                        value={nouveauProduit.nom}
                        onChange={(e) => setNouveauProduit({ ...nouveauProduit, nom: e.target.value })}
                      />
                      <input
                        type="text"
                        className="form-control mt-2"
                        placeholder="Description du produit"
                        value={nouveauProduit.description}
                        onChange={(e) => setNouveauProduit({ ...nouveauProduit, description: e.target.value })}
                      />
                         <select
                                className="form-control mt-3"
                                value={nouveauProduit.categorie}
                                onChange={handleCategorieChange}
                              >
                                <option value="">Choisir une catégorie</option>
                                {categories.map((categorie, index) => (
                                  <option key={index} value={categorie}>{categorie}</option>
                                ))}
                                <option value="ajouter">Ajouter une nouvelle catégorie</option>
                              </select>

                              {ajouterCategorie && (
                                <input
                                  type="text"
                                  className="form-control mt-2"
                                  placeholder="Ajouter une nouvelle catégorie"
                                  value={nouvelleCategorie}
                                  onChange={(e) => setNouvelleCategorie(e.target.value)}
                                />
                              )}
      
                       <input
                        type="text"
                        className="form-control mt-2"
                        placeholder="Prix d'achat du produit"
                        value={nouveauProduit.prixDachat}
                        onChange={(e) => setNouveauProduit({ ...nouveauProduit, prixDachat: e.target.value })}
                      />
                       <input
                        type="text"
                        className="form-control mt-2"
                        placeholder="Unite du produit"
                        value={nouveauProduit.unite}
                        onChange={(e) => setNouveauProduit({ ...nouveauProduit, unite: e.target.value })}
                      />
                      <input
                        type="number"
                        className="form-control mt-2"
                        placeholder="Quantité minimum"
                        value={nouveauProduit.quantiteMinimum}
                        onChange={(e) => setNouveauProduit({ ...nouveauProduit, quantiteMinimum: e.target.value })}
                      />
                      <button
                        className="btn btn-primary mt-2"
                        onClick={handleAjoutProduit}
                      >
                        Ajouter
                      </button>
                         <div className="button-groupu" style={{ display: 'flex', gap: '10px' }}>
    <button
        className="btn btn-primary"
        onClick={() => setAfficherFormulaireProduit(false)} // Définir à false sur clic
    >
        Annuler
    </button>
</div>

                    </div>
                  ) : (
                    <div className="produit-section mt-3">
                      <h6><i className="fa fa-box"></i> Choisir un Produit</h6>
                      <Select
    className="form-control mt-3"
    value={produit ? { label: produit.label, value: produit.label } : null}
    onChange={handleProduitChange}
    options={produitsOptionsWithAddOption}
    placeholder="Choisir un produit"
    isSearchable
    noOptionsMessage={() => customNoOptionMessage}
    isDisabled={!fournisseur}
/>

                          <div className="quantite-section mt-3 d-flex align-items-center">
 
                        <input
                          type="number"
                          className="form-control me-2"
                          placeholder="Quantité"
                          value={quantite}
                          onChange={(e) => setQuantite(e.target.value)}
                        />

                          
                        </div>

                       <input
                          type="number"
                          className="form-control mt-3"
                          placeholder="Prix d'achat"
                          value={prixAchat !== undefined && prixAchat !== null ? prixAchat : ''} 
                          onChange={(e) => setPrixAchat(e.target.value)}
                          readOnly
                          disabled={!fournisseur}
                        />
                      <button className="btn btn-primary mt-3" onClick={ajouterAuPanier}>Ajouter au Panier</button>

                    </div>
                  )}
                </div>
              )}

{panierCreer && (
   <div className="consultationL mt-3">
   <h6><i className="fa fa-shopping-basket"></i> Panier</h6>
   <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
       <table id="table-to-export" className="tableSo table-striped">
           <thead>
               <tr>
                   <th>Produit</th>
                   <th>Quantité Initiale</th>
                   {fournisseurInfo?.type === "ristourne" && (
                       <>
                           <th>Produits offerts</th>
                           <th>Quantité Finale</th>
                       </>
                   )}
                   <th>Unité</th>
                   <th>Prix d'Achat</th>
                   <th>Total</th>
               </tr>
           </thead>
           <tbody>
               {achats.map((achat) => (
                   <tr key={achat._id}>
                       <td>{achat.produit?.nom || "Produit inconnu"}</td>
                       <td>{achat.quantite}</td>
                       {fournisseurInfo?.type === "ristourne" && (
                           <>
                               <td>{achat.quantiteTotale - achat.quantite}</td>
                               <td>{achat.quantiteTotale}</td>
                           </>
                       )}
                       <td>{achat.produit?.unite || "Unité"}</td>
                       <td>{achat.prixAchat} Ar</td>
                       <td>{achat.total} Ar</td>
                   </tr>
               ))}
           </tbody>
       </table>
   </div>
   <div className="total-validation-container">
     <h6 className="total-text" >Total: {achats.reduce((acc, achat) => acc + achat.total, 0)} Ar</h6>
 <div className="fournisseur-section">
           <h6><i className="fa fa-truck"></i> Sélection de l'entrepôt</h6>
           <select
    className="form-control custom-select"
    value={entrepot}
    onChange={handleEntrepotChange}
>
    <option value="">Choisir un entrepôt</option>
    {entrepots.map((entrepotItem) => (
        <option key={entrepotItem._id} value={entrepotItem._id}>
            {entrepotItem.nom}
        </option>
    ))}
</select>

       </div>
       <div className="button-group" style={{ display: 'flex', gap: '10px' }}>
                   
                    <button className="btn7 " onClick={validerPanier}>
                        Valider l'Achat
                    </button>
                </div>
    </div>
</div>
)}

            </div>
          </div>
       
        </section>
      </main>
    </>
  );
}

export default AchatProduits;
