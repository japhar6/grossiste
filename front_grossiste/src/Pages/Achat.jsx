import React, { useState } from "react";
import "../Styles/Produit.css";
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
  const [nomsProduits, setNomsProduits] = useState(["Ordinateur", "Téléphone"]);

  const [nouveauType, setNouveauType] = useState("");
  const [nouveauNom, setNouveauNom] = useState("");
  const [ajoutNouveauProduit, setAjoutNouveauProduit] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

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
    if (nouveauType && nouveauNom) {
      if (!typesProduits.includes(nouveauType)) {
        setTypesProduits([...typesProduits, nouveauType]);
      }
      setNomsProduits([...nomsProduits, nouveauNom]);

      // Réinitialisation du formulaire après ajout
      setAjoutNouveauProduit(false);
      setProduit(nouveauNom); // Sélectionner directement le produit ajouté
      setNouveauType("");
      setNouveauNom("");
    }
  };

  const prixTotal = panier.reduce((acc, item) => acc + item.total, 0);

  // Filtrage des produits en fonction du terme de recherche
  const produitsFiltres = nomsProduits.filter(nom => nom.toLowerCase().includes(searchTerm.toLowerCase()));

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
                      <>
                        <input 
                          type="text" 
                          className="form-control mt-3" 
                          placeholder="Nom du produit (recherche possible)" 
                          value={searchTerm} 
                          onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                        <select className="form-control mt-3" value={produit} onChange={(e) => {
                          if (e.target.value === "new") {
                            setAjoutNouveauProduit(true);
                          } else {
                            setProduit(e.target.value);
                          }
                        }}>
                          <option value="">Nom du produit</option>
                          {produitsFiltres.map((nom, index) => (
                            <option key={index} value={nom}>{nom}</option>
                          ))}
                          <option value="new">+ Nouveau produit</option> {/* Toujours afficher le "+ Nouveau produit" */}
                        </select>
                      </>
                    ) : (
                      <>
                        <input 
                          type="text" 
                          className="form-control mt-3" 
                          placeholder="Type du nouveau produit" 
                          value={nouveauType} 
                          onChange={(e) => setNouveauType(e.target.value)} 
                        />
                        <input 
                          type="text" 
                          className="form-control mt-3" 
                          placeholder="Nom du nouveau produit" 
                          value={nouveauNom} 
                          onChange={(e) => setNouveauNom(e.target.value)} 
                        />
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
                          <td>{item.prixAchat} FCFA</td>
                          <td>{item.total} FCFA</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h6 className="mt-3">Total: {prixTotal} FCFA</h6>
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
