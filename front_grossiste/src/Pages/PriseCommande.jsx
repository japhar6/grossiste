import React, { useState,useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import Swal from "sweetalert2";
import "../Styles/Commade.css";
import axios from '../api/axios';

function PriseCommande() {
              const [newPerson, setNewPerson] = useState({
                nom: "",
                telephone: "",
                adresse: "",
              });


              // Définir l'état pour les produits sélectionnés
              const [selectedProducts, setSelectedProducts] = useState([]);

                const [commande, setCommande] = useState([]);
                const [typeQuantite, setTypeQuantite] = useState("");
                const [modePaiement, setModePaiement] = useState("");
                const [type, setType] = useState(""); 
              const [isNew, setIsNew] = useState(false); 
              const [selectedPerson, setSelectedPerson] = useState("");
              const [clients, setClients] = useState([]);
              const [commerciaux, setCommerciaux] = useState([]);
              const [checkedProduits, setCheckedProduits] = useState({});
              const [selectedId, setSelectedId] = useState("");
              const [produits, setProduits] = useState([]);
              const [searchTerm, setSearchTerm] = useState("");
              const [categorie, setCategorie] = useState("");
              const [categories, setCategories] = useState([]);

              const [selectedProduit, setSelectedProduit] = useState(null); 


                                const handleSelectChange = (e) => {
                                  const id = e.target.value;
                                  setSelectedPerson(id);
                                  setSelectedId(id); 
                                  setIsNew(id === "new");

                                  console.log("ID sélectionné :", id);
                                };
                                useEffect(() => {
                                  fetchClients();
                                  fetchCommerciaux();
                                }, []);
                                useEffect(() => {
                                
                                  fetchProduits();
                                }, []);

                                const fetchClients = async () => {
                                  try {
                                    const response = await axios.get("/api/client");
                                    setClients(response.data);
                                  } catch (error) {
                                    console.error("Erreur lors de la récupération des clients", error);
                                  }
                                };

                                const fetchCommerciaux = async () => {
                                  try {
                                    const response = await axios.get("/api/comercial");
                                    setCommerciaux(response.data);
                                  } catch (error) {
                                    console.error("Erreur lors de la récupération des commerciaux", error);
                                  }
                                };

                                // Créer une personne (client ou commercial)
                                const creerPersonne = async () => {
                                  try {
                                    // Vérification des données envoyées
                                    console.log("Données envoyées :", newPerson);

                                    // Validation des champs selon le type (client ou commercial)
                                    if (type === "client") {
                                      
                                      if (!newPerson.nom || !newPerson.telephone || !newPerson.adresse) {
                                        Swal.fire("Erreur", "Tous les champs nécessaires doivent être remplis pour le client", "error");
                                        return;
                                      }
                                    } else if (type === "commercial") {
                                      // Vérifier que le nom, le téléphone, l'email et le type sont remplis pour un commercial
                                      if (!newPerson.nom || !newPerson.telephone || !newPerson.email || !newPerson.type) {
                                        Swal.fire("Erreur", "Tous les champs nécessaires doivent être remplis pour le commercial", "error");
                                        return;
                                      }
                                    }

                                    // Déterminer l'URL selon le type (client ou commercial)
                                    const url = type === "client" ? "/api/client" : "/api/comercial/";
                                    
                                    // Envoi de la requête POST
                                    const response = await axios.post(url, newPerson);
                                    
                                    if (response.data) {
                                      Swal.fire(
                                        {
                                        icon: "success",
                                        title: "Succès",
                                        text: `${type === "client" ? "Client" : "Commercial"} créé avec succès !`,
                                        
                                  
                                        });
                                    
                                    
                                      if (type === "client") {
                                        setClients((prevClients) => [
                                          ...prevClients,
                                          { _id: response.data._id, nom: response.data.nom, telephone: response.data.telephone }
                                        ]);
                                      } else {
                                        setCommerciaux((prevCommerciaux) => [
                                          ...prevCommerciaux,
                                          { _id: response.data._id, nom: response.data.nom, telephone: response.data.telephone }
                                        ]);
                                      }

                                      // Recharger la liste des clients/commerciaux après l'ajout (facultatif si tu préfères éviter un appel réseau)
                                      const updatedList = await axios.get(url);  // Recharger les données à partir de l'API
                                      if (type === "client") {
                                        setClients(updatedList.data);
                                      } else {
                                        setCommerciaux(updatedList.data);
                                      }

                                      // Sélectionner le nouvel élément
                                      setSelectedPerson(response.data._id);
                                      setIsNew(false);

                                    
                                      setModePaiement('');
         
                                      setNewPerson({
                                        nom: '',
                                        telephone: '',
                                        adresse: '', 
                                        email: '',
                                        type: '',
                                      });
                                      
                           
                                      setSelectedPerson(null); 
                                    }
                                  } catch (error) {
                                    console.error("Erreur lors de la création du client/commercial", error.response?.data || error);
                                    Swal.fire("Erreur", "Une erreur s'est produite", "error");
                                  }
                                };

                                
                                const fetchProduits = async () => {
                                  try {
                                    const response = await axios.get("/api/produits/afficher");
                                    setProduits(response.data);

                                    // Extraire les catégories uniques
                                    const categoriesUniq = [
                                      ...new Set(response.data.map((produit) => produit.categorie)),
                                    ];
                                    setCategories(categoriesUniq); 
                                  } catch (error) {
                                    console.error("Erreur lors de la récupération des produits", error);
                                  }
                                };

                                // Filtrer les produits en fonction de la recherche et de la catégorie
                                const produitsFiltres = produits.filter((p) => {
                                  const matchesRecherche = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
                                  const matchesCategorie = categorie ? p.categorie === categorie : true;
                                  return matchesRecherche && matchesCategorie;
                                });

                                const handleCheckboxChange = (produit, quantite, typeQuantite, isChecked) => {
                                  if (quantite <= 0) return;

                                  setCheckedProduits((prev) => ({ ...prev, [produit._id]: isChecked }));

                                  setCommande((prevCommande) => {
                                    if (isChecked) {
                                      const existant = prevCommande.find((item) => item._id === produit._id);
                                      if (existant) {
                                        return prevCommande.map((item) =>
                                          item._id === produit._id
                                            ? { ...item, quantite: item.quantite + quantite, typeQuantite }
                                            : item
                                        );
                                      } else {
                                        return [...prevCommande, { ...produit, quantite, typeQuantite, prix: produit.prixdevente }];
                                      }
                                    } else {
                                      return prevCommande.filter((item) => item._id !== produit._id);
                                    }
                                  });
                                };



                                    const handleKeyDown = (produit, e) => {
                                      if (e.key === "Enter") {
                                        handleCheckboxChange(produit, produit.quantiteTemp || 1, typeQuantite, true);
                                      }
                                    };

                                    const validerCommande = async () => {
                                      if (!selectedPerson || commande.length === 0) {
                                          Swal.fire("Erreur", "Veuillez sélectionner un client/commercial et ajouter des produits", "error");
                                          return;
                                      }
                                  
                                      // Ne pas imposer la sélection du mode de paiement si c'est un commercial
                                      if (!modePaiement && type !== "commercial") {
                                          Swal.fire("Erreur", "Veuillez choisir un mode de paiement", "error");
                                          return;
                                      }
                                  
                                      // Récupérer l'ID du vendeur depuis LocalStorage
                                      const vendeurId = localStorage.getItem("userid"); 
                                      if (!vendeurId) {
                                          Swal.fire("Erreur", "ID du vendeur introuvable. Veuillez vous reconnecter.", "error");
                                          return;
                                      }
                                  
                                      // Vérifie si c'est un commercial ou un client
                                      const isCommercial = type === "commercial"; 
                                      const typeClient = isCommercial ? "Commercial" : "Client";
                                  
                                      const nouvelleCommande = {
                                          typeClient,
                                          commercialId: isCommercial ? selectedPerson : null, 
                                          clientId: !isCommercial ? selectedPerson : null, 
                                          vendeurId,
                                          produits: commande.map(prod => ({
                                              produit: prod._id, 
                                              quantite: prod.quantite,
                                          })),
                                          modePaiement: isCommercial ? "à crédit" : modePaiement, // Met par défaut à "crédit" pour les commerciaux
                                          statut: "en attente",
                                      };
                                  
                                      console.log("Commande prête à être envoyée :", nouvelleCommande);
                                  
                                      try {
                                          const response = await axios.post("/api/commandes/ajouter", nouvelleCommande);
                                  
                                          if (response.data) {
                                              Swal.fire({
                                                  title: "Commande validée",
                                                  text: "Votre commande a été enregistrée avec succès",
                                                  icon: "success",
                                                  confirmButtonText: "OK"
                                              }).then(() => {
                                                  // 🔹 Réinitialisation complète après validation
                                                  setCommande([]); 
                                                  setSelectedPerson(""); 
                                                  setModePaiement(""); 
                                                  setSearchTerm(""); 
                                                  setSelectedProducts([]); // ✅ Réinitialise les produits sélectionnés
                                                  setCheckedProduits({}); // ✅ Réinitialise les cases cochées
                                              });
                                          }
                                      } catch (error) {
                                          console.error("Erreur lors de l'enregistrement de la commande", error);
                                          Swal.fire("Erreur", "Une erreur s'est produite lors de l'enregistrement de la commande", "error");
                                      }
                                  };
                                  
                                  
                                  
                                  const handleProduitSelect = (produit) => {
                                    console.log("Produit sélectionné:", produit);
                                    setSelectedProduit(produit); // Mise à jour de l'état avec le produit sélectionné
                                  };
                                  
                                  const totalCommande = commande.reduce((total, item) => total + item.quantite * item.prix, 0);

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
        <select className="form-control" value={selectedPerson} onChange={handleSelectChange}>
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


{/* Affichage du formulaire si "Nouveau client" est sélectionné */}{isNew && (
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
    
    {type === "client" && (
      <input
        type="text"
        className="form-control mt-2"
        placeholder="Adresse"
        value={newPerson.adresse}
        onChange={(e) => setNewPerson({ ...newPerson, adresse: e.target.value })}
      />
    )}


  {type === "commercial" && (
    <>
      <input
        type="email"
        className="form-control mt-2"
        placeholder="Email"
        value={newPerson.email}
        onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
      />
      <input
        type="text"
        className="form-control mt-2"
        placeholder="Type (commercial)"
        value={newPerson.type}
        onChange={(e) => setNewPerson({ ...newPerson, type: e.target.value })}
      />
    </>
  )}


    <button
      className="btn btn-success mt-3"
      onClick={creerPersonne}
    >
      Créer {type === "client" ? "Client" : "Commercial"}
    </button>
  </div>


  )}



   
                  <select
                    className="form-control mt-2"
                    value={modePaiement}
                    onChange={(e) => setModePaiement(e.target.value)}
                  >
                    <option value="">Sélectionner le mode de paiement</option>
                    <option value="espèce">Espèce</option>
                    <option value="mobile money">Mobile Money</option>
                    <option value=" à crédit">Crédit</option>
                    <option value="virement bancaire">Virement bancaire</option>
                  </select>
                
              </div>

              {/* Liste des Produits (colonne droite) */}
              <div className="produits w-50 p-3">
                <h6><i className="fa fa-box"></i> Produits Disponibles</h6>
            <div className="d-flex">
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
            </div>

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

                                                          {searchTerm ? (
                                                          
                                                            produitsFiltres.length === 0 ? (
                                                              <tr>
                                                                <td colSpan="6" className="text-center">Aucun produit trouvé</td>
                                                              </tr>
                                                            ) : (
                                                              produitsFiltres.map((p) => (
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
                                                                      <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={p.unite || 'Non spécifiée'} 
               
                                                                        readOnly
                                                                      />
                                                                    </td>

                                                                  <td>
                                                                    <div className="input-checkbox-container">
                                                                    <input
                                                        type="checkbox"
                                                        className="checkbox-large"
                                                        checked={checkedProduits[p._id] || false}
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
                                                              ))
                                                            )
                                                          ) : (
                                                            // Si searchTerm est vide, ne rien afficher
                                                            <tr>
                                                              <td colSpan="6" className="text-center">Veuillez entrer un terme de recherche</td>
                                                            </tr>
                                                          )}
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
                                                         Total: {totalCommande} Ariary
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
