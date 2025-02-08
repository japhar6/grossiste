import React, { useState } from "react";
import "../Styles/Achat.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import Swal from "sweetalert2";
import Select from 'react-select'; // Importez react-select

function AchatProduits() {
  const [fournisseur, setFournisseur] = useState("");
  const [panier, setPanier] = useState([]);
  const [panierCreer, setPanierCreer] = useState(false);
  const [produit, setProduit] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [historiqueAchats, setHistoriqueAchats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typesProduits, setTypesProduits] = useState(["Électronique", "Alimentaire"]);
  const [nomsProduits, setNomsProduits] = useState([
    { nom: "Ordinateur", type: "Électronique" },
    { nom: "Téléphone", type: "Électronique" },
    { nom: "Ampoule", type: "Électronique" },
    { nom: "Armoire", type: "Meuble" },
    { nom: "Aspirateur", type: "Électronique" },
  ]);
  const [typeFiltre, setTypeFiltre] = useState("");
  const [dateFiltre, setDateFiltre] = useState("");
  const [nouveauProduit, setNouveauProduit] = useState({ nom: "", type: "" });
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

  const handleAjoutProduit = () => {
    if (nouveauProduit.nom && nouveauProduit.type) {
      // Ajouter le nouveau produit à la liste
      setNomsProduits([...nomsProduits, nouveauProduit]);
      setNouveauProduit({ nom: "", type: "" });
      setAfficherFormulaireProduit(false); // Cacher le formulaire
    }
  };

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

  // Formatage des options pour react-select
  const produitsOptions = getFilteredAndSortedProducts().map((item) => ({
    label: `${item.nom} (${item.type})`,
    value: item.nom,
  }));

  // Ajout de l'option "Ajouter un Nouveau Produit"
  const customNoOptionMessage = (
    <button
      className="btn btn-link mt-2"
      onClick={() => setAfficherFormulaireProduit(true)}
    >
      Ajouter un Nouveau Produit
    </button>
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
                        <option value="">Tous les types</option>
                        {typesProduits.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                        ))}
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
                      onChange={(e) => setFournisseur(e.target.value)}
                    >
                      <option value="">Choisir un fournisseur</option>
                      <option value="F1">Fournisseur 1</option>
                      <option value="F2">Fournisseur 2</option>
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
                        placeholder="Type du produit"
                        value={nouveauProduit.type}
                        onChange={(e) => setNouveauProduit({ ...nouveauProduit, type: e.target.value })}
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
                      />
                      <input
                        type="number"
                        className="form-control mt-3"
                        placeholder="Quantité"
                        value={quantite}
                        onChange={(e) => setQuantite(e.target.value)}
                      />
                      <input
                        type="number"
                        className="form-control mt-3"
                        placeholder="Prix d'achat"
                        value={prixAchat}
                        onChange={(e) => setPrixAchat(e.target.value)}
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
