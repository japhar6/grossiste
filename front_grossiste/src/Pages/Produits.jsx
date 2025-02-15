import React, { useState, useEffect } from "react";
import "../Styles/Produit.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import axios from "axios";

function ListeProduits() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [recherche, setRecherche] = useState("");
  const [categorie, setCategorie] = useState("");
  const [dateAjout, setDateAjout] = useState("");
  const [order, setOrder] = useState("asc"); 
  const [orderBy, setOrderBy] = useState("nom"); 

  useEffect(() => {
    fetchProduits();
  }, []);

 
  const fetchProduits = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/produits/afficher");
      setProduits(response.data);

      const categoriesUniq = [
        ...new Set(response.data.map((produit) => produit.categorie)),
      ];
      setCategories(categoriesUniq); 
    } catch (error) {
      console.error("Erreur lors de la récupération des produits", error);
    }
  };

  
  const filteredProduits = produits.filter((produit) => {
    const matchesRecherche = produit.nom.toLowerCase().includes(recherche.toLowerCase());
    const matchesCategorie = categorie ? produit.categorie === categorie : true;
    const matchesDate = dateAjout ? produit.dateAjout.includes(dateAjout) : true;
    return matchesRecherche && matchesCategorie && matchesDate;
  });

  const sortedProduits = filteredProduits.sort((a, b) => {
    let comparison = 0;


    if (orderBy === "nom") {
      comparison = a.nom.localeCompare(b.nom);
    }

    // Tri par date d'ajout
    if (orderBy === "dateAjout") {
      const dateA = new Date(a.dateAjout); 
      const dateB = new Date(b.dateAjout);
      comparison = dateA - dateB; 
    }


    if (order === "desc") {
      comparison *= -1;
    }

    return comparison;
  });

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

              <div className="consultation">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                    <th>Code Produit</th>
                      <th>
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setOrderBy("nom");
                            setOrder(order === "asc" ? "desc" : "asc");
                          }}
                        >
                          Nom{" "}
                          {orderBy === "nom" && (order === "asc" ? "↑" : "↓")}
                        </span>
                      </th>
                      <th>Description</th>
                      <th>Prix de Vente</th>
                      <th>Prix d'Achat</th>
                      <th>Catégorie</th>
                      <th>
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            setOrderBy("dateAjout");
                            setOrder(order === "asc" ? "desc" : "asc");
                          }}
                        >
                          Date d'Ajout{" "}
                          {orderBy === "dateAjout" && (order === "asc" ? "↑" : "↓")}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedProduits.map((produit) => (
                      <tr key={produit._id}>
                        <td>{produit.codeProduit}</td>
                        <td>{produit.nom}</td>
                        <td>{produit.description}</td>
                        <td>{produit.prixdevente} Ariary</td>
                        <td>{produit.prixDachat} Ariary</td>
                        <td>{produit.categorie}</td>
                        <td>{produit.dateAjout}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default ListeProduits;
