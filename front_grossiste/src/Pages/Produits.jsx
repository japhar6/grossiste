import React, { useState, useEffect } from "react";
import "../Styles/Produit.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import axios from '../api/axios';
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import Swal from 'sweetalert2';

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
  const [loadingEntrepots, setLoadingEntrepots] = useState(false);
  const [loadingMagasiniers, setLoadingMagasiniers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [produitInfo, setProduitInfo] = useState(null);

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
    setLoadingEntrepots(true);
    try {
      const response = await axios.get("/api/produits/afficher");
      setProduits(response.data);
      setLoadingEntrepots(false);
      const categoriesUniq = [...new Set(response.data.map((produit) => produit.categorie))];
      setCategories(categoriesUniq);

      const initialUnites = {};
      response.data.forEach(produit => {
        initialUnites[produit._id] = produit.unites[0]?.nom;
      });
      setUniteSelectionnee(initialUnites);
    } catch (error) {
      setLoadingEntrepots(false);
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
    setLoadingAction(true);
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
      // Effectuer les mises à jour
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

      // Réinitialiser les prix modifiés après la mise à jour
      setPrixAchatModifier((prev) => ({ ...prev, [produitId]: undefined }));
      setPrixVenteModifier((prev) => ({ ...prev, [produitId]: undefined }));
      setProduitAModifier(null);

      // Rafraîchir les produits
      fetchProduits();

    } catch (error) {
      console.error("Erreur lors de la mise à jour des prix et de la quantité minimum:", error);
    } finally {
      // Désactiver le loading après la fin de l'opération
      setLoadingAction(false);
    }
  };

  const handleShowModal = (produit) => {
    setProduitInfo(produit); // Charger les informations du produit dans le modal
    setShowModal(true); // Afficher le modal

    // Charger la conversion de chaque unité dans le modal
    const uniteActuelle = produit.unites.find((u) => u.nom === produit.unites[0]?.nom);
    setUniteSelectionnee((prev) => ({
      ...prev,
      [produit._id]: uniteActuelle?.nom,
    }));
  };

  const handleCloseModal = () => {
    setShowModal(false); // Fermer le modal
    setProduitInfo(null); // Réinitialiser les informations du produit
  };

  const handleModifierProduit = async () => {
    const updates = {
      nom: produitInfo.nom,
      unites: produitInfo.unites, // Assurez-vous que chaque unité est correctement modifiée
    };
  
    setLoadingAction(true);
    try {
      // Envoyer les données mises à jour à l'API
      await axios.put(`/api/produits/info/${produitInfo._id}`, updates);
      fetchProduits(); // Rafraîchir la liste des produits
      handleCloseModal(); // Fermer le modal après la mise à jour
      Swal.fire({
        icon: 'success',
        title: 'Produit mis à jour !',
        text: 'Les informations du produit ont été modifiées avec succès.',
        confirmButtonColor: '#3085d6',
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du produit:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "La mise à jour du produit a échoué.",
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoadingAction(false);
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
              {loadingEntrepots ? (
                <div className="loading-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
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
                                    <>
                                      {loadingAction ? (
                                        <button className="btnpro btn-success" disabled>
                                          <Spinner animation="border" size="sm" /> Enregistrement...
                                        </button>
                                      ) : (
                                        <button
                                          className="btnpro btn-success"
                                          onClick={() => handleModifierPrix(produit._id)}
                                        >
                                          Enregistrer
                                        </button>
                                      )}
                                    </>
                                  ) : (
                                    <button
                                      className="btnpro btn-danger"
                                      onClick={() => setProduitAModifier(produit._id)}
                                    >
                                      Modifier
                                    </button>
                                  )}
                                  <button className="btnpro btn-primary" onClick={() => handleShowModal(produit)}>Info</button>
                                </td>


                              </tr>
                            );
                          })}
                        </tbody>
                      )}
                    </table>
                  </div>
                </div>)}
              <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Modifier Produit</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    {/* Affichage du nom du produit */}
                    <Form.Group controlId="nomProduit">
                      <Form.Label>Nom du produit</Form.Label>
                      <Form.Control
                        type="text"
                        value={produitInfo?.nom}
                        onChange={(e) => setProduitInfo({ ...produitInfo, nom: e.target.value })}
                      />
                    </Form.Group>

                    {/* Affichage des unités et de leurs conversions */}
                    <Form.Group controlId="uniteProduit">
                      <Form.Label>Unités</Form.Label>
                      {produitInfo?.unites.map((unite, index) => (
                        <div key={unite._id} className="unite-row">
                          <div className="unite-column">
                            <Form.Label>Nom de l'unité</Form.Label>
                            <Form.Control
                              type="text"
                              value={unite.nom}
                              onChange={(e) => {
                                const newUnites = [...produitInfo.unites];
                                newUnites[index].nom = e.target.value;
                                setProduitInfo({ ...produitInfo, unites: newUnites });
                              }}
                            />
                          </div>
                          <div className="unite-column">
                            <Form.Label>Conversion</Form.Label>
                            <Form.Control
                              type="number"
                              value={unite.conversion}
                              onChange={(e) => {
                                const newUnites = [...produitInfo.unites];
                                newUnites[index].conversion = parseInt(e.target.value);
                                setProduitInfo({ ...produitInfo, unites: newUnites });
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </Form.Group>
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Fermer
                  </Button>
                  <Button variant="primary" onClick={handleModifierProduit} disabled={loadingAction}>
                    {loadingAction ? "Chargement..." : "Sauvegarder"}
                  </Button>
                </Modal.Footer>
              </Modal>

            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default ListeProduits;
