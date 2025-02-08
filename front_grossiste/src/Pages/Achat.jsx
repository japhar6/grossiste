  import React, { useState, useEffect } from "react";
  import "../Styles/Achat.css";
  import Sidebar from "../Components/Sidebar";
  import Header from "../Components/Navbar";
  import Swal from "sweetalert2";

  function AchatProduits() {
    const [fournisseur, setFournisseur] = useState("");
    const [fournisseurs, setFournisseurs] = useState([]);
    const [panier, setPanier] = useState([]);
    const [panierCreer, setPanierCreer] = useState(false);
    const [produit, setProduit] = useState("");
    const [quantite, setQuantite] = useState("");
    const [prixAchat, setPrixAchat] = useState("");

    const [produits, setProduits] = useState([]); // Nouveau état pour les produits
    const [searchTerm, setSearchTerm] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [ajoutNouveauProduit, setAjoutNouveauProduit] = useState(false);
    const [nouveauNom, setNouveauNom] = useState("");
    const [nouveauType, setNouveauType] = useState("");

  
    useEffect(() => {
      fetch("http://localhost:5000/api/produits/afficher")  
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setProduits(data); 
          } else {
            Swal.fire({
              title: "Erreur",
              text: "Impossible de récupérer les produits.",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        })
        .catch((error) => {
          Swal.fire({
            title: "Erreur",
            text: "Une erreur est survenue lors de la récupération des produits.",
            icon: "error",
            confirmButtonText: "OK",
          });
          console.error("Erreur lors de la récupération des produits:", error);
        });
    }, []);

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
          console.error("Erreur lors de la récupération des fournisseurs:", error);
        });
    }, []);
  
    useEffect(() => {
      if (fournisseur) {
        fetch(`http://localhost:5000/api/produits/fournisseur/${fournisseur}`)
          .then((response) => response.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setProduits(data);
            } else {
              setProduits([]);
              Swal.fire({
                title: "Aucun produit",
                text: "Ce fournisseur ne propose aucun produit.",
                icon: "info",
                confirmButtonText: "OK",
              });
            }
          })
          .catch((error) => {
            Swal.fire({
              title: "Erreur",
              text: "Impossible de récupérer les produits du fournisseur.",
              icon: "error",
              confirmButtonText: "OK",
            });
            console.error("Erreur lors de la récupération des produits:", error);
          });
      } else {
        setProduits([]);
      }
    }, [fournisseur]); // Déclenche la requête à chaque changement de fournisseur
    
    const produitsFiltres = produits.filter(
      (produit) => produit.fournisseur === fournisseur
    );
    
    // Fonction pour ajouter au panier
    const ajouterAuPanier = () => {
      if (produit && quantite && prixAchat) {
        const nouvelArticle = { produit, quantite, prixAchat, total: quantite * prixAchat };
        setPanier([...panier, nouvelArticle]);
        setProduit("");
        setQuantite("");
        setPrixAchat("");
      }
    };

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
          console.error("Erreur lors de la création du panier:", error);
        });
    };

    // Fonction pour valider l'achat
    const validerPanier = () => {
      Swal.fire({
        title: "Panier validé",
        text: "Votre achat a été effectué avec succès.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        setPanierCreer(false);
        setFournisseur("");
        setPanier([]);
      });
    };

    return (
      <main className="center">
        <Sidebar />
        <section className="contenue2">
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3">
              <h6 className="alert alert-info">
                <i className="fa fa-shopping-cart"></i> Achat Fournisseur
              </h6>
              {!panierCreer && (
                <div className="filtrage bg-light p-3 mt-3">
                  <button className="btn btn-success" onClick={creerNouveauPanier}>
                    Créer un Nouveau Panier
                  </button>
                </div>
              )}

              {panierCreer && (
                <div className="achat-container">
                  <div className="fournisseur-section mt-3">
                    <h6><i className="fa fa-truck"></i> Sélection du Fournisseur</h6>
                    <select
                      className="form-control mt-3"
                      value={fournisseur}
                      onChange={(e) => setFournisseur(e.target.value)}
                    >
                      <option value="">Choisir un fournisseur</option>
                      {fournisseurs.map((fournisseurItem) => (
                        <option key={fournisseurItem._id} value={fournisseurItem._id}>
                          {fournisseurItem.nom}  
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="produit-section">
                    <h6><i className="fa fa-box"></i> Ajouter un Produit</h6>

                    <div className="autocomplete">
                      <input
                        type="text"
                        className="form-control mt-3"
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      />
                      {showSuggestions && (
                        <ul className="suggestions-list">
                                      {produits
                      .filter((p) => p.nom.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((p, index) => (


                              <li
                                key={index}
                                onClick={() => {
                                  setProduit(p.nom);
                                  setSearchTerm(p.nom);
                                  setShowSuggestions(false);
                                }}
                              >
                                {p.nom} ({p.type})
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>

                    <input type="number" className="form-control mt-3" placeholder="Quantité" value={quantite} onChange={(e) => setQuantite(e.target.value)} />
                    <input type="number" className="form-control mt-3" placeholder="Prix d'achat" value={prixAchat} onChange={(e) => setPrixAchat(e.target.value)} />
                    <button className="btn btn-primary mt-3" onClick={ajouterAuPanier}>Ajouter au Panier</button>
                  </div>
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
                          <td>{item.prixAchat}</td>
                          <td>{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="btn btn-success mt-3" onClick={validerPanier}>Valider l'Achat</button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    );
  }

  export default AchatProduits;
