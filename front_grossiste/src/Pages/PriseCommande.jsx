import React, { useState,useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import Swal from "sweetalert2";
import "../Styles/Commade.css";
import axios from "axios";

function PriseCommande() {
  const [client, setClient] = useState({ nom: "", telephone: "", adresse: "" });
  const [produits, setProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [commande, setCommande] = useState([]);
  const [typeQuantite, setTypeQuantite] = useState("cartons");
  const [modePaiement, setModePaiement] = useState("");
 const [categorie, setCategorie] = useState("");
  const [categories, setCategories] = useState([]); 


  const [selectedClient, setSelectedClient] = useState("");
  const [type, setType] = useState(""); // "client" ou "commercial"
const [isNew, setIsNew] = useState(false); // Indique si on ajoute un nouveau
const [selectedPerson, setSelectedPerson] = useState("");
const [clients, setClients] = useState([]);
const [commerciaux, setCommerciaux] = useState([]);

useEffect(() => {
  fetchClients();
  fetchCommerciaux();
}, []);

const fetchClients = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/client");
    setClients(response.data);
  } catch (error) {
    console.error("Erreur lors de la récupération des clients", error);
  }
};

const fetchCommerciaux = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/comercial");
    setCommerciaux(response.data);
  } catch (error) {
    console.error("Erreur lors de la récupération des commerciaux", error);
  }
};

  

 
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
  {
    const matchesRecherche = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = categorie ? p.categorie === categorie : true;
    return matchesRecherche &&   matchesCategorie ;
});
  
  const filteredProduits = produits.filter((produit) => {
    const matchesCategorie = categorie ? produit.categorie === categorie : true;
    return  matchesCategorie ;
  });

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3">
            <h6 className="alert alert-info text-start">
              <i className="fa fa-shopping-cart"></i> Prise de Commande
            </h6>
            <div className="form-group mt-3">
  <label>Type :</label>
  <select
    className="form-control"
    value={type}
    onChange={(e) => {
      setType(e.target.value);
      setIsNew(false);
      setSelectedPerson("");
    }}
  >
    <option value="">Choisir un type</option>
    <option value="client">Client</option>
    <option value="commercial">Commercial</option>
  </select>
</div>


             
            <div className="commande-container d-flex justify-content-between">
              {/* Informations Client (colonne gauche) */}
              <div className="client-info w-50 p-3">
                <h6><i className="fa fa-user"></i> Informations Client</h6>
                <div className="form-group mt-3">
                {type && (
  <div className="form-group mt-3">
    <label>{type === "client" ? "Sélectionner un client" : "Sélectionner un commercial"}</label>
    <select
      className="form-control"
      value={selectedPerson}
      onChange={(e) => {
        setSelectedPerson(e.target.value);
        setIsNew(e.target.value === "new");
      }}
    >
      <option value="">Sélectionner</option>
      {(type === "client" ? clients : commerciaux).map((p) => (
        <option key={p._id} value={p._id}>
          {p.nom} - {p.telephone}
        </option>
      ))}
      <option value="new">Ajouter un nouveau {type}</option>
    </select>
  </div>
)}

</div>

{/* Affichage du formulaire si "Nouveau client" est sélectionné */}
{isNew && (
  <div className="form-group mt-3">
    <input
      type="text"
      className="form-control"
      placeholder={`Nom du ${type}`}
      value={newPerson.nom}
      onChange={(e) => setNewPerson({ ...newPerson, nom: e.target.value })}
    />
    <input
      type="text"
      className="form-control mt-2"
      placeholder="Téléphone"
      value={newPerson.telephone}
      onChange={(e) => setNewPerson({ ...newPerson, telephone: e.target.value })}
    />
    <input
      type="text"
      className="form-control mt-2"
      placeholder="Adresse"
      value={newPerson.adresse}
      onChange={(e) => setNewPerson({ ...newPerson, adresse: e.target.value })}
    />
  </div>
)}


   
                  <select
                    className="form-control mt-2"
                    value={modePaiement}
                    onChange={(e) => setModePaiement(e.target.value)}
                  >
                    <option value="">Sélectionner le mode de paiement</option>
                    <option value="cash">Cash</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="credit">Crédit</option>
                    <option value="virement">Virement bancaire</option>
                  </select>
                
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
                <table className="table mt-2">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Type</th>
                      <th>Prix</th>
                      <th>Quantité</th>
                      <th>Unité</th>
                      <th>Ajouter</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produitsFiltres.map((p) => (
                          <tr key={p._id}>
                    <td>{p.nom}</td>
                    <td>{p.categorie}</td>
                        <td>{p.prixdevente} Ariary</td>
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
                    <th>Unité</th>
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
                      <td>{item.prix} Ariary</td>
                      <td>{item.quantite * item.prix} Ariary</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h6 className="total">
                Total:  Ariary
              </h6>
              <button className="btn btn-success  mt-3" onClick={validerCommande}>
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
