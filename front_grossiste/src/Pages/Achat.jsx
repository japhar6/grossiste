import React, { useState,useEffect } from "react";
import "../Styles/Achat.css";
import Sidebar from "../Components/Sidebar";

import Header from "../Components/Navbar";
import Swal from "sweetalert2";
import Select from 'react-select'; 
import HistoriqueAchats from "../Components/HistoriqueAchats";

function AchatProduits() {
  const [fournisseur, setFournisseur] = useState("");
  const [fournisseurs, setFournisseurs] = useState([]);
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
const [achats, setAchats] = useState([]);
  const [typeFiltre, setTypeFiltre] = useState("");
  const [dateFiltre, setDateFiltre] = useState("");
  const [nouveauProduit, setNouveauProduit] = useState({ nom: "", categorie: "" ,description :"",prixDachat: "",unite:"",fournisseur:""});
  const [afficherFormulaireProduit, setAfficherFormulaireProduit] = useState(false);
  const [produitId, setProduitId] = useState(""); 
  const handleProduitChange = (selectedOption) => {
    if (!selectedOption) return; 

    // Assurez-vous que l'objet contient bien la propriété value (l'ID du produit)
    const produitId = selectedOption.value; // Récupérer l'ID du produit
console.log("produit" ,produitId);
    if (!produitId) {
      console.error("ID du produit manquant");
      return;
    }
    setProduitId(produitId);
    // Mettre à jour le produit sélectionné
    setProduit(selectedOption);

    // Faire une requête pour récupérer les détails du produit
    fetch(`http://localhost:5000/api/produits/recuperer/${produitId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setPrixAchat(data.prixDachat); // Mettre à jour le prix d'achat
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du produit:", error);
        setPrixAchat(""); // Réinitialiser en cas d'erreur
      });
  };

  useEffect(() => {
    fetch("http://localhost:5000/api/produits/categories")
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Erreur lors de la récupération des catégories", error));
  }, []);
  const [produitsOptions, setProduitsOptions] = useState([]);
  
  const handleAjoutProduit = (e) => {
    e.preventDefault();
  
    // Validation des champs
    if (!nouveauProduit.nom || !nouveauProduit.categorie || !nouveauProduit.unite || !nouveauProduit.fournisseur) {
      alert("Tous les champs requis doivent être remplis.");
      return;
    }
  
    // Ajouter la nouvelle catégorie si nécessaire
    const categorieFinale = ajouterCategorie ? nouvelleCategorie : nouveauProduit.categorie;
  
    const produit = {
      ...nouveauProduit,
      categorie: categorieFinale,
      prixDachat: parseFloat(nouveauProduit.prixDachat),
    };
  
    // Envoi du produit à l'API pour ajout
    fetch("http://localhost:5000/api/produits/ajouter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(produit),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Produit ajouté avec succès");
  
        // Réinitialiser le formulaire
        setNouveauProduit({
          nom: "",
          description: "",
          prixDachat: "",
          categorie: "",
          unite: "",
          fournisseur: "",
        });
        setNouvelleCategorie("");
        setAjouterCategorie(false);
        setAfficherFormulaireProduit(false);
  
       
        if (fournisseur) {
          fetch(`http://localhost:5000/api/produits/fournisseur/${fournisseur}`)
            .then((response) => response.json())
            .then((data) => {
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
            })
            .catch((error) => {
              setProduitsOptions([]);
              Swal.fire({
                title: "Erreur",
                text: "Une erreur est survenue lors de la récupération des produits.",
                icon: "error",
                confirmButtonText: "OK",
              });
            });
        }
      })
      .catch((error) => {
        alert("Erreur lors de l'ajout du produit");
        console.error(error);
      });
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
      const response = await fetch(`http://localhost:5000/api/achats/panier/${panierId}`);
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la récupération des achats.");
      }
  
      setAchats(data.achats);
    } catch (error) {
      console.error("Erreur :", error);
    }
  };
  
  useEffect(() => {
    if (fournisseur) {
      fetch(`http://localhost:5000/api/produits/fournisseur/${fournisseur}`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const options = data.map((produit) => ({
              label: `${produit.nom} - ${produit.categorie}`,  
              value: produit._id,  // Assurez-vous que vous utilisez l'_id ici
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
        })
        .catch((error) => {
          setProduitsOptions([]);
          Swal.fire({
            title: "Erreur",
            text: "Une erreur est survenue lors de la récupération des produits.",
            icon: "error",
            confirmButtonText: "OK",
          });
        });
    } else {
      setProduitsOptions([]);
    }
  }, [fournisseur]);  
  


  useEffect(() => {
    fetch("http://localhost:5000/api/fournisseurs/tous")
      .then((response) => response.json())
      .then((data) => {
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
      })
      .catch((error) => {
        Swal.fire({
          title: "Erreur",
          text: "Une erreur est survenue lors de la récupération des fournisseurs.",
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  }, []);   
  
  const creerNouveauPanier = async () => {
  
    const panierData = {
      fournisseur,
      produits: panier,
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/paniers/ajouter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(panierData),
      });
  
      const data = await response.json();
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
  
    if (isNaN(quantiteNumerique)) {
      Swal.fire({
        title: "Erreur",
        text: "La quantité doit être un nombre valide.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
  
  
    console.log("ID du panier avant envoi :", panierId); // Vérifie que l'ID est correct ici

    const total = quantiteNumerique * prixAchat;
  
    const achatData = {
      fournisseur: fournisseur,
      panierId: panierId,  // L'ID du panier
      produit: produitId,  // L'ID du produit
      quantite: quantiteNumerique,  // Quantité du produit
      prixAchat: prixAchat,  // Prix d'achat du produit
      total: total,  // Total calculé
      dateAchat: new Date().toISOString(),  // Date actuelle de l'achat
    };
  
    console.log("Données envoyées pour création de l'achat :", achatData);
  
    try {
      const response = await fetch("http://localhost:5000/api/achats/ajouter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(achatData),
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la création de l'achat");
      }
  
      Swal.fire({
        title: "Succès",
        text: "Achat ajouté avec succès.",
        icon: "success",
        confirmButtonText: "OK",
      });
      fetchAchats();
      // Réinitialisation des champs après succès
      setFournisseur("");  // Réinitialiser fournisseur
    
      setQuantite("");     // Réinitialiser quantité
      setPrixAchat("");    // Réinitialiser prixAchat
      setProduit("");      // Réinitialiser produit
    } catch (error) {
      console.error("Erreur lors de la création de l'achat :", error);
      Swal.fire({
        title: "Erreur",
        text: error.message || "Une erreur est survenue.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };


  /*
  const produitId = produit._id;
  
  const updatePrix = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/produits/modifier/${produitId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prixDachat: prixAchat,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Produit mis à jour avec succès', data);
      } else {
        console.error('Erreur lors de la mise à jour du produit');
      }
    } catch (error) {
      console.error('Erreur réseau', error);
    }
  };

  updatePrix();
*/
  const validerPanier = () => {
    Swal.fire({
      title: "Panier validé",
      text: "Votre achat a été effectué avec succès.",
      icon: "success",
      confirmButtonText: "OK",
    }).then(() => {
      const achat = {
        fournisseur,
        date: new Date().toLocaleString(),
        total: panier.reduce((acc, item) => acc + item.total, 0),
        produits: panier,
      };
      setHistoriqueAchats([achat, ...historiqueAchats]);
      setPanierCreer(false);
      setFournisseur("");
      setPanier([]);
    });
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
      className="btn btn-link mt-2"
      onClick={() => setAfficherFormulaireProduit(true)}
    >
      Ajouter un Nouveau Produit
    </button>
  );

    const handleFournisseurChange = (e) => {
      const selectedFournisseur = e.target.value;  
      setFournisseur(selectedFournisseur);  
      console.log(selectedFournisseur);
      setNouveauProduit({ ...nouveauProduit, fournisseur: selectedFournisseur });  
    };
    
    
  

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
                  <button className="btn1 btn1-success" onClick={creerNouveauPanier}>
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
                        placeholder="description du produit"
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
                        placeholder="prixDachat du produit"
                        value={nouveauProduit.prixDachat}
                        onChange={(e) => setNouveauProduit({ ...nouveauProduit, prixDachat: e.target.value })}
                      />
                       <input
                        type="text"
                        className="form-control mt-2"
                        placeholder="unite du produit"
                        value={nouveauProduit.unite}
                        onChange={(e) => setNouveauProduit({ ...nouveauProduit, unite: e.target.value })}
                      />
                      <button
                        className="btn btn-primary mt-2"
                        onClick={handleAjoutProduit}
                      >
                        Ajouter
                      </button>
                    </div>
                  ) : (
                    <div className="produit-section mt-3">
                      <h6><i className="fa fa-box"></i> Choisir un Produit</h6>
                      <Select
  className="form-control mt-3"
  value={produit ? { label: produit.label, value: produit.label } : null} 
  onChange={handleProduitChange}
  options={produitsOptions}
  placeholder="Choisir un produit"
  isSearchable
  noOptionsMessage={() => customNoOptionMessage}
  isDisabled={!fournisseur}
/>

                                            


                          <div className="quantite-section mt-3 d-flex align-items-center">
  {/* Saisie de la quantité */}
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
                          disabled={!fournisseur}
                        />
                      <button className="btn btn-primary mt-3" onClick={ajouterAuPanier}>Ajouter au Panier</button>

                    </div>
                  )}
                </div>
              )}

{panierCreer && (
  <div className="consultation mt-3">
    <h6><i className="fa fa-shopping-basket"></i> Panier</h6>
    <table className="table table-striped">
      <thead>
        <tr>
          <th>Produit</th>
          <th>Quantité</th>
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
      <td>{achat.produit?.unite || "Unité"}</td>
      <td>{achat.prixAchat} Ar</td>
      <td>{achat.total} Ar</td>
    </tr>
  ))}
</tbody>

    </table>
    
    {/* Total et bouton à droite */}
    <div className="total-validation-container">
    <h6>Total: {achats.reduce((acc, achat) => acc + achat.total, 0)} Ar</h6>
    <button className="btn btn-success" onClick={validerPanier}>Valider l'Achat</button>
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
