import React, { useState } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import Swal from "sweetalert2";
import "../Styles/Commade.css";

function PriseCommande() {
  const [client, setClient] = useState({ nom: "", telephone: "", adresse: "" });
  const [produits, setProduits] = useState([
    { id: 1, nom: "Ordinateur", prix: 300000, type: "Électronique" },
    { id: 2, nom: "Téléphone", prix: 150000, type: "Électronique" },
    { id: 3, nom: "Casque", prix: 50000, type: "Accessoire" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [commande, setCommande] = useState([]);
  const [typeQuantite, setTypeQuantite] = useState("cartons");

  const handleCheckboxChange = (produit, quantite, typeQuantite, isChecked) => {
    if (quantite <= 0 || !isChecked) return;

    const existant = commande.find((item) => item.id === produit.id);
    if (existant) {
      setCommande(
        commande.map((item) =>
          item.id === produit.id
            ? { ...item, quantite: item.quantite + quantite, typeQuantite }
            : item
        )
      );
    } else {
      setCommande([...commande, { ...produit, quantite, typeQuantite }]);
    }
  };

  const handleKeyDown = (produit, e) => {
    if (e.key === "Enter") {
      handleCheckboxChange(produit, produit.quantiteTemp || 1, typeQuantite, true);
    }
  };

  const validerCommande = () => {
    if (!client.nom || !client.telephone || commande.length === 0) {
      Swal.fire("Erreur", "Veuillez remplir toutes les informations", "error");
      return;
    }
    Swal.fire("Commande validée", "Votre commande a été enregistrée", "success");
    setCommande([]);
    setClient({ nom: "", telephone: "", adresse: "" });
  };

  const produitsFiltres = produits.filter((p) =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue2">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3">
            <h6 className="alert alert-info text-start">
              <i className="fa fa-shopping-cart"></i> Prise de Commande
            </h6>

            <div className="commande-container d-flex justify-content-between">
              {/* Informations Client (colonne gauche) */}
              <div className="client-info w-50 p-3">
                <h6><i className="fa fa-user"></i> Informations Client</h6>
                <div className="form-group mt-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nom du client"
                    value={client.nom}
                    onChange={(e) => setClient({ ...client, nom: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-control mt-2"
                    placeholder="Téléphone"
                    value={client.telephone}
                    onChange={(e) => setClient({ ...client, telephone: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-control mt-2"
                    placeholder="Adresse"
                    value={client.adresse}
                    onChange={(e) => setClient({ ...client, adresse: e.target.value })}
                  />
                </div>
              </div>

              {/* Liste des Produits (colonne droite) */}
              <div className="produits w-50 p-3">
                <h6><i className="fa fa-box"></i> Produits Disponibles</h6>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <table className="table mt-2">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Type</th>
                      <th>Prix</th>
                      <th>Quantité</th>
                      <th>Type Quantité</th>
                      <th>Ajouter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produitsFiltres.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nom}</td>
                        <td>{p.type}</td>
                        <td>{p.prix} FCFA</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            onChange={(e) => (p.quantiteTemp = parseInt(e.target.value) || 1)}
                            onKeyDown={(e) => handleKeyDown(p, e)}
                          />
                        </td>
                        <td>
                          <select
                            className="form-control"
                            value={typeQuantite}
                            onChange={(e) => setTypeQuantite(e.target.value)}
                          >
                            <option value="cartons">Cartons</option>
                            <option value="kilos">Kilos</option>
                            <option value="bidons">Bidons</option>
                          </select>
                        </td>
                        <td>
                          <div className="input-checkbox-container">
                            <input
                              type="checkbox"
                              className="checkbox-large"
                              onChange={(e) =>
                                handleCheckboxChange(
                                  p,
                                  p.quantiteTemp || 1,
                                  typeQuantite,
                                  e.target.checked
                                )
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Récapitulatif de la Commande */}
            <div className="commande mt-4">
              <h6><i className="fa fa-receipt"></i> Récapitulatif Commande</h6>
              <table className="table table-bordered mt-2">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Quantité</th>
                    <th>Type de Quantité</th>
                    <th>Prix Unitaire</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {commande.map((item, index) => (
                    <tr key={index}>
                      <td>{item.nom}</td>
                      <td>{item.quantite}</td>
                      <td>{item.typeQuantite}</td>
                      <td>{item.prix} FCFA</td>
                      <td>{item.quantite * item.prix} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h6 className="total">
                Total: {commande.reduce((acc, item) => acc + item.quantite * item.prix, 0)} FCFA
              </h6>
              <button className="btn btn-success mt-3" onClick={validerCommande}>
                Enregistrer la Commande
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PriseCommande;
