import React, { useState, useEffect } from "react";
import "../Styles/Produit.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import axios from '../api/axios';

function ListeProduits() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uniteSelectionnee, setUniteSelectionnee] = useState({});
  const [produitAModifier, setProduitAModifier] = useState(null);
  const [prixAchatModifier, setPrixAchatModifier] = useState({});
  const [prixVenteModifier, setPrixVenteModifier] = useState({});
  const [quantiteMinimumModifier, setQuantiteMinimumModifier] = useState({});
  const [recherche, setRecherche] = useState("");
  const [categorie, setCategorie] = useState("");
  const [dateAjout, setDateAjout] = useState("");
  const [orderBy, setOrderBy] = useState("nom");
  const [order, setOrder] = useState("asc");


  const filtrerProduits = () => {
    return produits.filter((produit) => {
      const correspondanceRecherche =
        produit.nom.toLowerCase().includes(recherche.toLowerCase()) || 
        produit.codeProduit.toLowerCase().includes(recherche.toLowerCase());

      const correspondanceCategorie =
        categorie === "" || produit.categorie === categorie;

      const correspondanceDate = 
        dateAjout === "" || new Date(produit.dateAjout).toISOString().split('T')[0] === dateAjout;

      return correspondanceRecherche && correspondanceCategorie && correspondanceDate;
    }).sort((a, b) => {
      const comparison = order === "asc" ? 1 : -1;
      if (a[orderBy] < b[orderBy]) return -1 * comparison;
      if (a[orderBy] > b[orderBy]) return 1 * comparison;
      return 0;
    });
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const response = await axios.get("/api/produits/afficher");
      setProduits(response.data);
      
      const categoriesUniq = [...new Set(response.data.map((produit) => produit.categorie))];
      setCategories(categoriesUniq);
      
      const initialUnites = {};
      response.data.forEach(produit => {
        initialUnites[produit._id] = produit.unites[0]?.nom;
      });
      setUniteSelectionnee(initialUnites);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits", error);
    }
  };

  const handleChangeUnite = (produit, uniteNom) => {
    setUniteSelectionnee((prev) => ({
      ...prev,
      [produit._id]: uniteNom,
    }));
  };

  const handleModifierPrix = async (produitId) => {
    const prixDachat = prixAchatModifier[produitId]; 
    const prixdevente = prixVenteModifier[produitId]; 
    const uniteNomDachat = uniteSelectionnee[produitId]; 
    const uniteNomVente = uniteSelectionnee[produitId]; 
    const quantiteMinimum = quantiteMinimumModifier[produitId];

    const updates = {};

    if (prixDachat !== undefined) {
      updates.prixDachat = prixDachat;
      updates.uniteNomDachat = uniteNomDachat;
    }

    if (prixdevente !== undefined) {
      updates.prixdevente = prixdevente;
      updates.uniteNomVente = uniteNomVente;
    }

    if (quantiteMinimum !== undefined) {
      updates.quantiteMinimum = quantiteMinimum;
    }

    try {
      if (updates.prixDachat) {
        await axios.put(`/api/produits/produits/maodi/${produitId}`, {
          prixDachat: updates.prixDachat,
          uniteNom: updates.uniteNomDachat,
        });
      }

      if (updates.prixdevente) {
        await axios.put(`/api/produits/produits/modifier-prix-vente/${produitId}`, {
          prixdevente: updates.prixdevente,
          uniteNom: updates.uniteNomVente,
        });
      }

      if (updates.quantiteMinimum) {
        await axios.put(`/api/produits/produits/modifier-quantite-minimum/${produitId}`, {
          quantiteMinimum: updates.quantiteMinimum,
        });
      }

      // Réinitialisez les prix modifiés après la mise à jour
      setPrixAchatModifier((prev) => ({ ...prev, [produitId]: undefined }));
      setPrixVenteModifier((prev) => ({ ...prev, [produitId]: undefined }));
      setProduitAModifier(null);

      fetchProduits();
    } catch (error) {
      console.error("Erreur lors de la mise à jour des prix et de la quantité minimum:", error);
    }
  };

  return (
    <>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3">
              <h6 className="alert alert-success">
                <i className="fa fa-box"></i> Liste des Produits
              </h6>
              <div className="filtrage bg-light p-3 mt-3">
                <h6 className="fw-bold">
                  <i className="fa fa-search"></i> Filtrage
                </h6>
                <form className="center">
                  <input
                    type="text"
                    className="form-control p-2 mt-3 m-2"
                    placeholder="Recherche ..."
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                  />
                  <select
                    className="form-control mt-3 m-2 p-2"
                    value={categorie}
                    onChange={(e) => setCategorie(e.target.value)}
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    className="form-control mt-3 m-2 p-2"
                    value={dateAjout}
                    onChange={(e) => setDateAjout(e.target.value)}
                  />
                </form>
              </div>
              <div className="consultatiof">
                <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                  <table className="tableSt mt-3">
                    <thead>
                      <tr>
                        <th>Code Produit</th>
                        <th>
                          <span
                            style={{ cursor: "pointer", color: 'white' }}
                            onClick={() => {
                              setOrderBy("nom");
                              setOrder(order === "asc" ? "desc" : "asc");
                            }}
                          >
                            Nom{" "}
                            {orderBy === "nom" && (order === "asc" ? "↑" : "↓")}
                          </span>
                        </th>
                        <th>Prix d'Achat</th>
                        <th>Prix de Vente</th>
                        <th>Unité</th>
                        <th>Catégorie</th>
                        <th>Quantité Minimum</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    {filtrerProduits().length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center">
                          <strong>Aucun produit trouvé.</strong>
                        </td>
                      </tr>
                    ) : (
                      <tbody>
                        {filtrerProduits().map((produit) => {
                          const uniteActuelle = produit.unites.find((u) =>
                            u.nom === (uniteSelectionnee[produit._id] || produit.unites[0]?.nom)
                          );

                          const prixAchat = uniteActuelle
                            ? Math.round(produit.prixDachat / uniteActuelle.conversion)
                            : "N/A";
                          const prixVente = uniteActuelle && uniteActuelle.prixdevente !== undefined
                            ? Math.round(uniteActuelle.prixdevente)
                            : "N/A";

                          return (
                            <tr key={produit._id}>
                              <td>{produit.codeProduit}</td>
                              <td>{produit.nom}</td>
                              <td>
                                {produitAModifier === produit._id ? (
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={prixAchatModifier[produit._id] || prixAchat}
                                    onChange={(e) => setPrixAchatModifier((prev) => ({ ...prev, [produit._id]: e.target.value }))}
                                    placeholder={produit.prixDachat}
                                  />
                                ) : (
                                  <span style={{ color: 'black' }}>{prixAchat} Ariary</span>
                                )}
                              </td>
                              <td>
                                {produitAModifier === produit._id ? (
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={prixVenteModifier[produit._id] || prixVente}
                                    onChange={(e) => setPrixVenteModifier((prev) => ({ ...prev, [produit._id]: e.target.value }))}
                                    placeholder={uniteActuelle?.prixdevente || 0}
                                  />
                                ) : (
                                  <span style={{ color: 'black' }}>{prixVente} Ariary</span>
                                )}
                              </td>
                              <td>
                                <select
                                  className="form-control"
                                  value={uniteSelectionnee[produit._id] || produit.unites[0]?.nom}
                                  onChange={(e) => handleChangeUnite(produit, e.target.value)}
                                >
                                  <option value="">Sélectionner unité</option>
                                  {produit.unites.map((unite) => (
                                    <option key={unite.nom} value={unite.nom}>
                                      {unite.nom}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td>{produit.categorie}</td>
                              <td>
                                {produitAModifier === produit._id ? (
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={quantiteMinimumModifier[produit._id] || produit.quantiteMinimum}
                                    onChange={(e) => setQuantiteMinimumModifier((prev) => ({ ...prev, [produit._id]: e.target.value }))}
                                    placeholder={produit.quantiteMinimum}
                                  />
                                ) : (
                                  <span style={{ color: 'black' }}>
                                  {produit.quantiteMinimum ?? 0} {produit.unites.reduce((min, unite) => 
                                    unite.conversion > min.conversion ? unite : min, produit.unites[0]).nom}
                                </span>
                                )}
                              </td>
                              <td>
                                {produitAModifier === produit._id ? (
                                  <button
                                    className="btnpro btn-success"
                                    onClick={() => handleModifierPrix(produit._id)}
                                  >
                                    Enregistrer
                                  </button>
                                ) : (
                                  <button
                                  className="btnpro btn-danger"
                                  onClick={() => setProduitAModifier(produit._id)}
                                >
                                  Modifier
                                </button>
                                
                                
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default ListeProduits;
