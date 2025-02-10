import React, { useState,useEffect } from "react";
import "../Styles/Achat.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import Swal from "sweetalert2";
import Select from 'react-select'; 

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
 const [produitsOptions, setProduitsOptions] = useState([]);

  const [typeFiltre, setTypeFiltre] = useState("");
  const [dateFiltre, setDateFiltre] = useState("");
  const [nouveauProduit, setNouveauProduit] = useState({ nom: "", categorie: "" ,description :"",prixDachat: "",unite:"",fournisseur:""});
  const [afficherFormulaireProduit, setAfficherFormulaireProduit] = useState(false);

  const ajouterAuPanier = () => {
    if (produit && quantite && prixAchat) {
      const nouvelArticle = { produit, quantite, prixAchat, total: quantite * prixAchat };
      setPanier([...panier, nouvelArticle]);
      setProduit("");
      setQuantite("");
      setPrixAchat("");
    }
  };
  useEffect(() => {
    fetch("http://localhost:5000/api/produits/categories")
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Erreur lors de la récupération des catégories", error));
  }, []);
  
  const handleAjoutProduit = (e) => {
    e.preventDefault();

    if (!nouveauProduit.nom || !nouveauProduit.categorie || !nouveauProduit.unite || !nouveauProduit.fournisseur) {
      alert("Tous les champs requis doivent être remplis.");
      return;
    }

    // Si une nouvelle catégorie est saisie, l'ajouter à la catégorie du produit
    const categorieFinale = ajouterCategorie ? nouvelleCategorie : nouveauProduit.categorie;

    const produit = {
      ...nouveauProduit,
      categorie: categorieFinale,
      prixDachat: parseFloat(nouveauProduit.prixDachat),
    };

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
        setNouveauProduit({
          nom: "",
          description: "",
          prixDachat: "",
          categorie: "",
          unite: "",
          fournisseur: "",
        });
        setNouvelleCategorie("")
        setAjouterCategorie(false); 
        setAfficherFormulaireProduit(false);  
        const nouveauProduitOption = {
          label: `${data.nom} - ${data.prixAchat} Ar`,
          value: data.nom,
        };

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

  // Fonction pour récupérer les fournisseurs
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
   // Fonction pour créer le panier
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
        if (data && data.message === "Panier créé avec succès") {
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
          Swal.fire({
            title: "Erreur",
            text: data.message || "Impossible de créer le panier.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          title: "Erreur",
          text: "Une erreur est survenue lors de la création du panier.",
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  };

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



  // Fonction pour trier les produits en fonction de la recherche
  const getFilteredAndSortedProducts = () => {
    const filteredProducts = nomsProduits.filter((product) =>
      product.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Trier les produits pour que ceux qui commencent par la lettre de recherche viennent en premier
    return filteredProducts.sort((a, b) => {
      const matchA = a.nom.toLowerCase().startsWith(searchTerm.toLowerCase()) ? 0 : 1;
      const matchB = b.nom.toLowerCase().startsWith(searchTerm.toLowerCase()) ? 0 : 1;
      return matchA - matchB;
    });
  };


  // Ajout de l'option "Ajouter un Nouveau Produit"
  const customNoOptionMessage = (
    <button
      className="btn btn-link mt-2"
      onClick={() => setAfficherFormulaireProduit(true)}
    >
      Ajouter un Nouveau Produit
    </button>
  );
    // Fonction pour gérer la sélection du fournisseur
    const handleFournisseurChange = (e) => {
      const selectedFournisseur = e.target.value;  
      setFournisseur(selectedFournisseur);  
      console.log(selectedFournisseur);
      setNouveauProduit({ ...nouveauProduit, fournisseur: selectedFournisseur });  
    };
    
    useEffect(() => {
      if (fournisseur) {
        fetch(`http://localhost:5000/api/produits/fournisseur/${fournisseur}`)
          .then((response) => response.json())
          .then((data) => {
            if (Array.isArray(data) && data.length > 0) {
              const options = data.map((produit) => ({
                label: `${produit.nom} - ${produit.prixAchat} Ar`,
                value: produit.nom,
              }));
              setProduitsOptions(options);
            } else {
              // Vider la liste des produits si aucun produit n'est trouvé pour ce fournisseur
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
            // En cas d'erreur, vider aussi la liste des produits
            setProduitsOptions([]);
            Swal.fire({
              title: "Erreur",
              text: "Une erreur est survenue lors de la récupération des produits.",
              icon: "error",
              confirmButtonText: "OK",
            });
          });
      } else {
        // Si aucun fournisseur n'est sélectionné, vider les produits
        setProduitsOptions([]);
      }
    }, [fournisseur]);
    
  

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
                <div className="historique-section mt-3">
                  <h6>Historique des Achats</h6>
                  <div className="filtrage bg-light p-3 mt-3">
                    <h6 className="fw-bold">
                      <i className="fa fa-search"></i> Filtrage
                    </h6>
                    <form className="center">
                      <input
                        type="text"
                        className="form-control p-2 mt-3 m-2"
                        placeholder="Recherche par fournisseur"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <select
                        className="form-control mt-3 m-2 p-2"
                        value={typeFiltre}
                        onChange={(e) => setTypeFiltre(e.target.value)}
                      >
                       
                      </select>
                      <input
                        type="date"
                        className="form-control mt-3 m-2 p-2"
                        value={dateFiltre}
                        onChange={(e) => setDateFiltre(e.target.value)}
                      />
                    </form>
                  </div>

                  <table className="table table-striped mt-3">
                    <thead>
                      <tr>
                        <th>Fournisseur</th>
                        <th>Date</th>
                        <th>Produit</th>
                        <th>Type</th>
                        <th>Quantité</th>
                        <th>Total</th>
                        <th>Détails</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistorique.map((achat, index) => (
                        achat.produits.map((produit, idx) => (
                          <tr key={`${index}-${idx}`}>
                            {idx === 0 && (
                              <td rowSpan={achat.produits.length}>{achat.fournisseur}</td>
                            )}
                            {idx === 0 && (
                              <td rowSpan={achat.produits.length}>{achat.date}</td>
                            )}
                            <td>{produit.produit}</td>
                            <td>{produit.type || "Non défini"}</td>
                            <td>{produit.quantite}</td>
                            <td>{produit.total} Ar</td>
                            {idx === 0 && (
                              <td rowSpan={achat.produits.length}>
                                <button className="btn btn-info">Voir Détails</button>
                              </td>
                            )}
                          </tr>
                        ))
                      ))}
                    </tbody>
                  </table>
                </div>
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
                        value={produit ? { label: produit, value: produit } : null}
                        onChange={(selectedOption) => setProduit(selectedOption.value)}
                        options={produitsOptions}
                        placeholder="Choisir un produit"
                        isSearchable
                        noOptionsMessage={() => customNoOptionMessage}
                        isDisabled={!fournisseur} 
                      />
                          

                      <input
                        type="number"
                        className="form-control mt-3"
                        placeholder="Quantité"
                        value={quantite}
                        onChange={(e) => setQuantite(e.target.value)}
                        disabled={!fournisseur} 
                      />
                      <input
                        type="number"
                        className="form-control mt-3"
                        placeholder="Prix d'achat"
                        value={prixAchat}
                        onChange={(e) => setPrixAchat(e.target.value)}
                        disabled={!fournisseur} 
                      />
                      <button className="btn btn-primary mt-3" onClick={ajouterAuPanier}  disabled={!fournisseur} >Ajouter au Panier</button>
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
