import React, { useState,useEffect } from "react";
import Sidebar from "../Components/SidebarVendeur";
import Header from "../Components/NavbarV";
import Swal from "sweetalert2";
import "../Styles/Commade.css";
import axios from '../api/axios';
 
import Sound from "../assets/mixkit-clear-announce-tones-2861.wav"

function PriseCommande() {
              const [newPerson, setNewPerson] = useState({
                nom: "",
                telephone: "",
                adresse: "",
              });
              const playSound = () => {
                const audio = new Audio(Sound); 
                audio.play();
            };
            

              // Définir l'état pour les produits sélectionnés
              const [selectedProducts, setSelectedProducts] = useState([]);
              const [quantiteDispo, setQuantiteDispo] = useState([]); 
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
                                    const response = await axios.get("/client");
                                    setClients(response.data);
                                  } catch (error) {
                                    console.error("Erreur lors de la récupération des clients", error);
                                  }
                                };

                                const fetchCommerciaux = async () => {
                                  try {
                                    const response = await axios.get("/comercial");
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
                                    const url = type === "client" ? "/client" : "/comercial/";
                                    
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
                                    const response = await axios.get("/produits/afficher");
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
                                  // Ne rien faire si la quantité demandée est inférieure ou égale à 0
                                  if (quantite <= 0) return;
                                
                                  const fetchQuantite = async () => {
                                    try {
                                      // Récupérer la quantité disponible pour le produit dans l'entrepôt principal
                                      const response = await axios.get(`/stocks/produits/quantite/${produit._id}`);
                                      const quantiteDisponible = response.data.quantiteDisponible;
                                
                                      // Comparer la quantité demandée avec la quantité disponible
                                      if (isChecked) {
                                        if (quantite > quantiteDisponible) {
                                          const result = await Swal.fire({
                                            title: 'Quantité Insuffisante',
                                            text: `Il n'en reste que (${quantiteDisponible}) dans l'entrepôt principal.`,
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonText: 'OK',
                                            cancelButtonText: 'Choisir un autre entrepôt',
                                            customClass: {
                                              confirmButton: 'btn btn-success', // Ajoutez une classe CSS pour le bouton de confirmation
                                              cancelButton: 'btn btn-danger' // Ajoutez une classe CSS pour le bouton d'annulation
                                            },
                                            buttonsStyling: false, 
                                          });
                                
                                          if (result.isConfirmed) {
                                            // L'utilisateur a cliqué sur "OK"
                                            return; // Ne pas ajouter à la commande
                                          } else if (result.isDismissed) {
                                            // L'utilisateur a cliqué sur "Choisir un autre entrepôt"
                                            const responseSecondaire = await axios.get(`/stocks/produits/quantita/${produit._id}`);
                                            const quantiteDisponibleSecondaire = responseSecondaire.data.quantiteDisponible;
                                
                                            // Logique pour traiter la disponibilité dans les autres entrepôts
                                            // Vous pouvez ici ajouter une alerte ou d'autres actions si nécessaire
                                            if (quantite > quantiteDisponibleSecondaire) {
                                              Swal.fire({
                                                title: 'Quantité Insuffisante',
                                                text: `Il n'en reste que (${quantiteDisponibleSecondaire}) dans les autres entrepôts.`,
                                                icon: 'warning',
                                                confirmButtonText: 'OK',
                                              });
                                              return; // Ne pas ajouter à la commande
                                            } else {
                                              // Ajoutez à la commande si la quantité est disponible dans les autres entrepôts
                                              setCheckedProduits((prev) => ({ ...prev, [produit._id]: true }));
                                              setCommande((prevCommande) => {
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
                                              });
                                            }
                                          }
                                        } else {
                                          // Si la quantité est suffisante dans l'entrepôt principal
                                          setCheckedProduits((prev) => ({ ...prev, [produit._id]: true }));
                                          setCommande((prevCommande) => {
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
                                          });
                                        }
                                      } else {
                                        // Si la case à cocher est désactivée, retirer le produit de la commande
                                        setCommande((prevCommande) => prevCommande.filter((item) => item._id !== produit._id));
                                        setCheckedProduits((prev) => ({ ...prev, [produit._id]: false }));
                                      }
                                    } catch (error) {
                                      console.error("Erreur lors de la récupération de la quantité disponible", error);
                                    }
                                  };
                                
                                  fetchQuantite(); // Appeler la fonction pour récupérer la quantité
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
                                  
                                      if (!modePaiement && type !== "commercial") {
                                          Swal.fire("Erreur", "Veuillez choisir un mode de paiement", "error");
                                          return;
                                      }
                                  
                                      const vendeurId = localStorage.getItem("userid"); 
                                      if (!vendeurId) {
                                          Swal.fire("Erreur", "ID du vendeur introuvable. Veuillez vous reconnecter.", "error");
                                          return;
                                      }
                                  
                                      const isCommercial = type === "commercial"; 
                                      const typeClient = isCommercial ? "Commercial" : "Client";
                                  
                                      const produitsInvalides = commande.filter(prod => !prod._id || prod.quantite <= 0);
                                      if (produitsInvalides.length > 0) {
                                          Swal.fire("Erreur", "Tous les produits doivent avoir un ID valide et une quantité positive.", "error");
                                          return;
                                      }
                                  
                                      const nouvelleCommande = {
                                          typeClient,
                                          commercialId: isCommercial ? selectedPerson : null, 
                                          clientId: !isCommercial ? selectedPerson : null, 
                                          vendeurId,
                                          produits: commande.map(prod => ({
                                              produit: prod._id, 
                                              quantite: prod.quantite,
                                          })),
                                          modePaiement: isCommercial ? "à crédit" : modePaiement,
                                          statut: "en cours",
                                      };
                                  
                                      console.log("Commande prête à être envoyée :", nouvelleCommande);
                                  
                                      try {
                                          const response = await axios.post("/commandes/ajouter", nouvelleCommande);
                                  
                                          if (response.data) {
                                              const referenceFacture = response.data.commande.referenceFacture; 
                                              playSound();
                                              Swal.fire({
                                                  title: "Commande validée",
                                                  text: `Votre commande a été enregistrée avec succès. Référence de Facture : ${referenceFacture}`,
                                                  icon: "success",
                                                  confirmButtonText: "OK"
                                              }).then(() => {
                                                  setCommande([]); 
                                                  setSelectedPerson(""); 
                                                  setModePaiement(""); 
                                                  setSearchTerm(""); 
                                                  setSelectedProducts([]); 
                                                  setCheckedProduits({}); 
                                              });
                                          }
                                      } catch (error) {
                                          console.error("Erreur lors de l'enregistrement de la commande", error.response ? error.response.data : error.message);
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
          <div className="mini-star p-3">
            
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
   <div className="container mt-3" style={{ marginLeft:'-25px', padding: '20px', overflow: 'hidden' }}>
   <div className="form-group">
       <div className="row">
           <div className="col-12">
               <input
                   type="text"
                   className="form-control"
                   placeholder={`Nom du ${type}`}
                   value={newPerson.nom}
                   onChange={(e) => setNewPerson({ ...newPerson, nom: e.target.value })}
               />
           </div>

           <div className="col-12 mt-2">
               <input
                   type="text"
                   className="form-control"
                   placeholder="Téléphone"
                   value={newPerson.telephone}
                   onChange={(e) => setNewPerson({ ...newPerson, telephone: e.target.value })}
               />
           </div>

           {type === "client" && (
               <div className="col-12 mt-2">
                   <input
                       type="text"
                       className="form-control"
                       placeholder="Adresse"
                       value={newPerson.adresse}
                       onChange={(e) => setNewPerson({ ...newPerson, adresse: e.target.value })}
                   />
               </div>
           )}

           {type === "commercial" && (
               <>
                   <div className="col-12 mt-2">
                       <input
                           type="email"
                           className="form-control"
                           placeholder="Email"
                           value={newPerson.email}
                           onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                       />
                   </div>
                   <div className="col-12 mt-2">
                       <input
                           type="text"
                           className="form-control"
                           placeholder="Type (commercial)"
                           value={newPerson.type}
                           onChange={(e) => setNewPerson({ ...newPerson, type: e.target.value })}
                       />
                   </div>
               </>
           )}

           <div className="col-12 mt-3">
               <button
                   className="btn btn-success"
                   onClick={creerPersonne}
               >
                   Créer {type === "client" ? "Client" : "Commercial"}
               </button>
           </div>
       </div>
   </div>
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
    className="form-control"
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


            <div className="table-container">
              <table className="tablepro mt-2">
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
                                                                <td className="margin-left-mobile">{p.nom}</td>
                                                                <td className="margin-left-mobile">{p.categorie}</td>
                                                                <td className="margin-left-mobile">{p.prixdevente} Ariary</td>
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
                                        </div>
                                       
                                          {/* Récapitulatif de la Commande */}
                                          <div className="commande mt-4">
                                            <h6><i className="fa fa-receipt"></i> Récapitulatif Commande</h6>
                                            
                                            <div className="table-container" style={{ overflowX: 'auto',overflowY:'auto' }}>
            
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
                                                        <td>{item.unite}</td>
                                                        <td>{item.prix} Ariary</td> 
                                                        <td>{item.quantite * item.prix} Ariary</td>

                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                            </div>
                                         
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
