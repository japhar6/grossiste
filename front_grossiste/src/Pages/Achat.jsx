import React, { useState } from "react";
import "../Styles/Achat.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import Swal from "sweetalert2";

function AchatProduits() {
  const [fournisseur, setFournisseur] = useState("");
  const [panier, setPanier] = useState([]);
  const [panierCreer, setPanierCreer] = useState(false);
  const [produit, setProduit] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixAchat, setPrixAchat] = useState("");

  const [typesProduits, setTypesProduits] = useState(["Électronique", "Alimentaire"]);
  const [nomsProduits, setNomsProduits] = useState([
    { nom: "Ordinateur", type: "Électronique" },
    { nom: "Téléphone", type: "Électronique" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [ajoutNouveauProduit, setAjoutNouveauProduit] = useState(false);
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouveauType, setNouveauType] = useState("");

  const ajouterAuPanier = () => {
    if (produit && quantite && prixAchat) {
      const nouvelArticle = { produit, quantite, prixAchat, total: quantite * prixAchat };
      setPanier([...panier, nouvelArticle]);
      setProduit("");
      setQuantite("");
      setPrixAchat("");
    }
  };

  const creerNouveauPanier = () => {
    setPanier([]);
    setPanierCreer(true);
  };

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

  const ajouterNouveauProduit = () => {
    if (nouveauNom && nouveauType) {
      if (!typesProduits.includes(nouveauType)) {
        setTypesProduits([...typesProduits, nouveauType]);
      }

      setNomsProduits([...nomsProduits, { nom: nouveauNom, type: nouveauType }]);
      setProduit(nouveauNom);
      setNouveauNom("");
      setNouveauType("");
      setAjoutNouveauProduit(false);
    }
  };

  const produitsFiltres = nomsProduits.filter((p) =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header></header>
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
                  <div className="fournisseur-section">
                    <h6><i className="fa fa-truck"></i> Sélection du Fournisseur</h6>
                    <select className="form-control mt-3" value={fournisseur} onChange={(e) => setFournisseur(e.target.value)}>
                      <option value="">Choisir un fournisseur</option>
                      <option value="F1">Fournisseur 1</option>
                      <option value="F2">Fournisseur 2</option>
                    </select>
                  </div>

                  <div className="produit-section">
                    <h6><i className="fa fa-box"></i> Ajouter un Produit</h6>

                    {!ajoutNouveauProduit ? (
                      <div className="autocomplete">
                        <input
                          type="text"
                          className="form-control mt-3"
                          placeholder="Rechercher ou ajouter un produit..."
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
                            {produitsFiltres.map((p, index) => (
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
                            {searchTerm && !produitsFiltres.find((p) => p.nom === searchTerm) && (
                              <li className="add-new" onClick={() => setAjoutNouveauProduit(true)}>
                                + Ajouter Nouveau Produit
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          className="form-control mt-3"
                          placeholder="Nom du nouveau produit"
                          value={nouveauNom}
                          onChange={(e) => setNouveauNom(e.target.value)}
                        />
                        <select
                          className="form-control mt-3"
                          value={nouveauType}
                          onChange={(e) => setNouveauType(e.target.value)}
                        >
                          <option value="">Sélectionner un type</option>
                          {typesProduits.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                          ))}
                        </select>
                        <button className="btn btn-success mt-3" onClick={ajouterNouveauProduit}>
                          Ajouter
                        </button>
                      </>
                    )}

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
                          <td>{item.prixAchat} Ar</td>
                          <td>{item.total} Ar</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h6 className="mt-3">Total: {panier.reduce((acc, item) => acc + item.total, 0)} Ar</h6>
                  <button className="btn btn-success mt-3" onClick={validerPanier}>Valider l'Achat</button>
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
