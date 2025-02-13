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

  const [typeFiltre, setTypeFiltre] = useState("");
  const [dateFiltre, setDateFiltre] = useState("");
  const [nouveauProduit, setNouveauProduit] = useState({ nom: "", categorie: "" ,description :"",prixDachat: "",unite:"",fournisseur:""});
  const [afficherFormulaireProduit, setAfficherFormulaireProduit] = useState(false);

  const handleProduitChange = (selectedOption) => {
    setProduit(selectedOption);  
  
    // Faire une requête pour récupérer les détails du produit
    fetch(`http://localhost:5000/api/produits/recuperer/${selectedOption.value}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setPrixAchat(data.prixDachat); 
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du produit:", error);
        setPrixAchat(""); 
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
  useEffect(() => {
    if (fournisseur) {
      fetch(`http://localhost:5000/api/produits/fournisseur/${fournisseur}`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const options = data.map((produit) => ({
              label: `${produit.nom} - ${produit.categorie}`,  
              value: produit._id,  
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
  
  const creerNouveauPanier = () => {
    const panierData = {
      fournisseur,
      produits: panier,
    };
    fetch("http://localhost:5000/api/paniers/ajouter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(panierData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Réponse API complète :", data); // Vérifie tout ce que l'API renvoie
        console.log("Panier :", data.panier); // Vérifie si `panier` existe
        console.log("Panier ID :", data.panier ? data.panier._id : "ID non trouvé"); // Vérifie si `_id` est bien présent
    
        if (data && data.message === "Panier créé avec succès" && data.panier?._id) {
          setPanierId(data.panier._id);
          console.log("Panier ID enregistré dans state :", data.panier._id);
    
          Swal.fire({
            title: "Panier créé avec succès",
            text: "Votre panier a été créé avec succès !",
            icon: "success",
            confirmButtonText: "OK",
          });
    
          setPanierCreer(true);
          setPanier([]);
          setFournisseur("");
        } else {
          console.error("Erreur : L'ID du panier est manquant.");
          Swal.fire({
            title: "Erreur",
            text: data.message || "Impossible de créer le panier.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      })
      .catch((error) => {
        console.error("Erreur lors de la requête :", error);
        Swal.fire({
          title: "Erreur",
          text: "Une erreur est survenue lors de la création du panier.",
          icon: "error",
          confirmButtonText: "OK",
        });
      });
     }
     const ajouterAuPanier = () => {
      if (produit && quantite && prixAchat) {
        const nouvelArticle = {
          produit,
          quantite,
          prixAchat,
          total: quantite * prixAchat,
          fournisseur: produit.fournisseur, // Assurez-vous que le produit a un fournisseur
          panier: panier._id, // Utilise l'id du panier actuel si disponible
        };
    
        // Vérifier si le produit est déjà dans le panier
        const produitExistant = panier.find((article) => article.produit === produit._id);
    
        // Si le produit est déjà dans le panier, on met à jour la quantité et le total
        if (produitExistant) {
          const panierMisAJour = panier.map((article) =>
            article.produit === produit._id
              ? {
                  ...article,
                  quantite: article.quantite + quantite,
                  total: (article.quantite + quantite) * prixAchat,
                }
              : article
          );
          setPanier(panierMisAJour);
        } else {
          // Ajouter le nouvel article au panier
          setPanier([...panier, nouvelArticle]);
        }
    
        // Réinitialiser les champs de saisie
        setProduit("");
        setQuantite("");
        setPrixAchat("");
    
        // Création de l'achat pour ce produit
        const creerAchat = async () => {
          const achatData = {
            produitId: produit._id, // Utilise `_id` du produit
            fournisseurId: produit.fournisseur._id, // Ajoute le fournisseur
            quantite,
            prixAchat,
            total: quantite * prixAchat,
            panierId: panier._id, // Ajoute l'id du panier
            dateAchat: new Date().toISOString(), // Ajoute la date actuelle
          };
    
          console.log(achatData); // Vérifie la structure des données avant d'envoyer
    
          try {
            const response = await fetch("http://localhost:5000/api/achats/ajouter", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(achatData),
            });
    
            if (!response.ok) {
              throw new Error("Erreur lors de la création de l'achat");
            }
    
            // Traitez la réponse ici si nécessaire
          } catch (error) {
            console.error(error);
          }
        };
    
        // Appel pour créer l'achat après la mise à jour du panier
        creerAchat();
      } else {
        console.error("Tous les champs requis ne sont pas remplis.");
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
        <section className="contenue2">
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3">
              <h6 className="alert alert-success">
                <i className="fa fa-shopping-cart"></i> Achat Fournisseur
              </h6>
              {!panierCreer && (
                <div className="filtrage bg-light p-3 mt-3">
                  <button className="btn btn-success" onClick={creerNouveauPanier}>
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
  value={produit ? { label: produit.label, value: produit.value } : null} 
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
          <th>Prix d'Achat</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {panier.map((item, index) => (
          <tr key={index}>
            <td>{item.produit}</td>
            <td>{item.quantite}</td>
            <td>{item.prixAchat} Ar</td>
            <td>{item.total} Ar</td>
          </tr>
        ))}
      </tbody>
    </table>
    
    {/* Total et bouton à droite */}
    <div className="total-validation-container">
      <h6>Total: {panier.reduce((acc, item) => acc + item.total, 0)} Ar</h6>
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
