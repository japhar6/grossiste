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
              
              const handleQuantiteChange = (produit, e) => {
                const nouvelleQuantite = parseInt(e.target.value, 10);
                
                // Vérifiez que la nouvelle quantité est valide (nombre positif)
                if (!isNaN(nouvelleQuantite) && nouvelleQuantite > 0) {
                  // Mettre à jour l'état avec la nouvelle quantité
                  setProduits((prevProduits) =>
                    prevProduits.map((p) =>
                      p._id === produit._id ? { ...p, quantiteTemp: nouvelleQuantite } : p
                    )
                  );
                  console.log(`Nouvelle quantité pour ${produit.nom}: ${nouvelleQuantite}`);
                }
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
                  const [uniteSelectionnee, setUniteSelectionnee] = useState({});
                const [categorie, setCategorie] = useState("");
                const [categories, setCategories] = useState([]);

                const [selectedProduit, setSelectedProduit] = useState(null); 

                const [remisesClient, setRemisesClient] = useState(null);
                const [typeRemise, setTypeRemise] = useState(null); // Ajouté pour stocker le type de remise
                

        
                useEffect(() => {
                  const fetchRemisesClient = async () => {
                    if (selectedPerson) {
                      try {
                        const response = await axios.get(`/api/client/recuperer/${selectedPerson}`);
                        setRemisesClient(response.data.remises);  // Récupère les remises du client
                        
                        // Vérifie quel type de remise existe et met à jour le typeRemise
                        if (response.data.remises.remiseGlobale > 0) {
                          setTypeRemise("remiseGlobale");
                        } else if (response.data.remises.remiseFixe > 0) {
                          setTypeRemise("remiseFixe");
                        } else if (response.data.remises.remiseParProduit > 0) {
                          setTypeRemise("remiseParProduit");
                        } else {
                          setTypeRemise(null); // Aucune remise spéciale
                        }
                        
                      } catch (error) {
                        console.error("Erreur lors de la récupération des remises du client", error);
                      }
                    }
                  };
                
                  fetchRemisesClient();
                }, [selectedPerson]); // Cette logique s'exécute à chaque fois que le client change
                

            

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

<<<<<<< HEAD
                                  const fetchClients = async () => {
                                    try {
                                      const response = await axios.get("/api/client/afficher");
                                      setClients(response.data);
                                    } catch (error) {
                                      console.error("Erreur lors de la récupération des clients", error);
                                    }
                                  };

                                  const fetchCommerciaux = async () => {
                                    try {
                                      const response = await axios.get("/api/comercial/");
                                      setCommerciaux(response.data);
                                    } catch (error) {
                                      console.error("Erreur lors de la récupération des commerciaux", error);
                                    }
                                  };

                                  // Créer une personne (client ou commercial)
                                  const creerPersonne = async () => {
                                    try {
                                      console.log("Données envoyées :", newPerson);
                                  
                                      if (type === "client") {
                                        if (!newPerson.nom ) {
                                          Swal.fire("Erreur", "Le nom est requis pour le client", "error");
                                          return;
=======
              const [remisesClient, setRemisesClient] = useState(null);
              const [typeRemise, setTypeRemise] = useState(null); // Ajouté pour stocker le type de remise
              
              useEffect(() => {
                const fetchRemisesClient = async () => {
                  if (selectedPerson) {
                    try {
                      const response = await axios.get(`/api/client/recuperer/${selectedPerson}`);
                      setRemisesClient(response.data.remises);  // Récupère les remises du client
                      
                      // Vérifie quel type de remise existe et met à jour le typeRemise
                      if (response.data.remises.remiseGlobale > 0) {
                        setTypeRemise("remiseGlobale");
                      } else if (response.data.remises.remiseFixe > 0) {
                        setTypeRemise("remiseFixe");
                      } else if (response.data.remises.remiseParProduit > 0) {
                        setTypeRemise("remiseParProduit");
                      } else {
                        setTypeRemise(null); // Aucune remise spéciale
                      }
                      
                    } catch (error) {
                      console.error("Erreur lors de la récupération des remises du client", error);
                    }
                  }
                };
              
                fetchRemisesClient();
              }, [selectedPerson]); // Cette logique s'exécute à chaque fois que le client change

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
                                    const response = await axios.get("/api/client/afficher");
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
                                    const url = type === "client" ? "/api/client/" : "/api/comercial/";
                                    
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
                                  // Ne rien faire si la quantité demandée est inférieure ou égale à 0
                                  if (quantite <= 0) return;
                                
                                  const fetchQuantite = async () => {
                                    try {
                                      // Récupérer la quantité disponible pour le produit dans l'entrepôt principal
                                      const response = await axios.get(`/api/stocks/produits/quantite/${produit._id}`);
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
                                            const responseSecondaire = await axios.get(`/api/stocks/produits/quantita/${produit._id}`);
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
>>>>>>> d197f132c72cd2305e34f803a733d05320993624
                                        }
                                      } else if (type === "commercial") {
                                        if (!newPerson.nom || !newPerson.telephone || !newPerson.email || !newPerson.type) {
                                          Swal.fire("Erreur", "Tous les champs nécessaires doivent être remplis pour le commercial", "error");
                                          return;
                                        }
                                      }
                                  
                                      const url = type === "client" ? "/api/client/" : "/api/comercial/";
                                      const response = await axios.post(url, newPerson);
                                      
                                      if (response.data && response.data._id) {
                                        Swal.fire({
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
                                  
                                        setSelectedPerson(response.data._id);
                                        setIsNew(false);
                                        setModePaiement('');
                                        setNewPerson({ nom: '', telephone: '', adresse: '', email: '', type: '' });
                                        setSelectedPerson(null);
                                      }
                                    } catch (error) {
                                      console.error("Erreur lors de la création du client/commercial", error.response?.data || error);
                                      Swal.fire("Erreur", "Une erreur s'est produite", "error");
                                    }
                                  };
                                  
                                  
<<<<<<< HEAD
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
                                  const handleChangeUnite = (produit, uniteNom) => {
                                    setUniteSelectionnee((prev) => ({
                                      ...prev,
                                      [produit._id]: uniteNom,
                                    }));
                                  };
                                  const handleCheckboxChange = (produit, quantite, typeQuantite, isChecked) => {
                                    // Ne rien faire si la quantité demandée est inférieure ou égale à 0
                                    if (quantite <= 0) return;
                                  
                                    const fetchQuantite = async () => {
                                      try {
                                        // Récupérer la quantité disponible pour le produit dans l'entrepôt principal
                                        const response = await axios.get(`/api/stocks/produits/quantite/${produit._id}`);
                                        const quantiteDisponible = response.data.quantiteDisponible;
                                  
                                        // Vérifier l'unité sélectionnée pour ce produit
                                        const uniteActuelle = produit.unites.find(
                                          (u) => u.nom === (uniteSelectionnee[produit._id] || produit.unites[0]?.nom)
                                        );
                                  
                                        if (!uniteActuelle) {
                                          Swal.fire({
                                            title: "Erreur",
                                            text: "Aucune unité valide sélectionnée pour ce produit.",
                                            icon: "error",
                                          });
                                          return;
                                        }
                                  
                                        // Obtenir le prix unitaire de l'unité sélectionnée
                                        const prixUnitaire = uniteActuelle.prixdevente || 0;
                                  
                                        if (isChecked) {
                                          if (quantite > quantiteDisponible) {
                                            // Si la quantité demandée dépasse celle de l'entrepôt principal
                                            const result = await Swal.fire({
                                              title: 'Quantité Insuffisante',
                                              text: `Il n'en reste que (${quantiteDisponible}) dans l'entrepôt principal.`,
                                              icon: 'warning',
                                              showCancelButton: true,
                                              confirmButtonText: 'OK',
                                              cancelButtonText: 'Choisir un autre entrepôt',
                                              customClass: {
                                                confirmButton: 'btn btn-success',
                                                cancelButton: 'btn btn-danger'
                                              },
                                              buttonsStyling: false,
                                            });
                                  
                                            if (result.isDismissed) {
                                              // L'utilisateur a choisi d'explorer d'autres entrepôts
                                              const responseSecondaire = await axios.get(`/api/stocks/produits/quantita/${produit._id}`);
                                              const quantiteDisponibleSecondaire = responseSecondaire.data.quantiteDisponible;
                                              const entrepotNomSecondaire = responseSecondaire.data.entrepotNom;
                                  
                                              if (quantite > quantiteDisponibleSecondaire) {
                                                Swal.fire({
                                                  title: 'Quantité Insuffisante',
                                                  text: `Il n'en reste que (${quantiteDisponibleSecondaire}) dans l'entrepôt "${entrepotNomSecondaire}".`,
                                                  icon: 'warning',
                                                  confirmButtonText: 'OK',
                                                });
                                                return; // Ne pas ajouter à la commande
                                              } else {
                                                Swal.fire({
                                                  title: 'Entrepot trouvé',
                                                  text: `Le produit a été trouvé depuis l'entrepôt "${entrepotNomSecondaire}".`,
                                                  icon: 'success',
                                                  confirmButtonText: 'OK',
                                                });
                                                // Ajoutez à la commande si la quantité est disponible dans les autres entrepôts
                                                updateCommande(produit, quantite, uniteActuelle.nom, prixUnitaire);
                                              }
                                            }
                                          } else {
                                            // Si la quantité est suffisante dans l'entrepôt principal
                                            updateCommande(produit, quantite, uniteActuelle.nom, prixUnitaire);
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
                                  
                                  // Fonction pour mettre à jour la commande
                                  const updateCommande = (produit, quantite, uniteNom, prixUnitaire) => {
                                    setCheckedProduits((prev) => ({ ...prev, [produit._id]: true }));
                                    setCommande((prevCommande) => {
                                      const existant = prevCommande.find((item) => item._id === produit._id);
                                      if (existant) {
                                        return prevCommande.map((item) =>
                                          item._id === produit._id
                                            ? { ...item, quantite: item.quantite + quantite }
                                            : item
                                        );
                                      } else {
                                        return [...prevCommande, {
                                          _id: produit._id,
                                          nom: produit.nom,
                                          quantite,
                                          unite: uniteNom,
                                          prix: prixUnitaire,
                                        }];
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
                                              prixUnitaire: prod.prixUnitaire, // Le prix unitaire original
                                              prixApresRemise: calculerPrixApresRemise(prod, typeRemise, valeurRemise),
                                          })),
                                          modePaiement: isCommercial ? "à crédit" : modePaiement,
                                          statut: "en cours",
                                          typeRemise,
                                          valeurRemise,
                                          totalGeneral: commande.reduce((total, prod) => total + (calculerPrixApresRemise(prod, typeRemise, valeurRemise) * prod.quantite), 0) // Calculer le total général après remise
                                      };
                                      
                                      console.log("Commande prête à être envoyée :", nouvelleCommande);
                                      
                                      try {
                                        const response = await axios.post("/api/commandes/ajouter", nouvelleCommande);
                                    
                                        if (response.data) {
                                            const commande = response.data.commande; // Récupérer la commande retournée par l'API
                                            console.log("Commande après enregistrement :", commande);
                                    
                                            // Vérification de la valeur de la remise renvoyée
                                            console.log("Valeur de la remise renvoyée par l'API : ", commande.valeurRemise);  // Vérifier ce que l'API renvoie.
                                    
                                            // Affichage des informations sur la remise et le prix après remise
                                            commande.produits.forEach(prod => {
                                                console.log(`Produit ID: ${prod.produit}`);
                                                console.log(`Prix Unitaire: ${prod.prixUnitaire}`);
                                                console.log(`Prix Après Remise: ${prod.prixApresRemise}`);
                                            });
                                    
                                            // Affichage de la remise globale si applicable
                                            if (commande.typeRemise === "remiseGlobale") {
                                                console.log(`Remise Globale Appliquée: ${commande.valeurRemise}%`);
                                            }
                                    
                                            // Affichage de la valeurRemise
                                            if (commande.valeurRemise !== undefined) {
                                                console.log(`Valeur de la Remise : ${commande.valeurRemise}`);  // Affichage de la remise
                                            } else {
                                                console.log("Valeur de la Remise est undefined.");
                                            }
                                    
                                            Swal.fire({
                                                title: "Commande validée",
                                                text: `Votre commande a été enregistrée avec succès. Référence de Facture : ${commande.referenceFacture}`,
                                                icon: "success",
                                                confirmButtonText: "OK"
                                            }).then(() => {
                                                // Réinitialisation des champs
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
                                    const valeurRemise = typeRemise === "remiseGlobale"
    ? remisesClient?.remiseGlobale
    : typeRemise === "remiseFixe"
      ? remisesClient?.remiseFixe
      : typeRemise === "remiseParProduit"
        ? remisesClient?.remiseParProduit
        : 0;
=======
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
                                };                                  
                              
                              
                              
                              const handleProduitSelect = (produit) => {
                                console.log("Produit sélectionné:", produit);
                                setSelectedProduit(produit); // Mise à jour de l'état avec le produit sélectionné
                              };
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
      setTypeRemise(null);  // Réinitialise le type de remise à chaque changement de type
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
>>>>>>> d197f132c72cd2305e34f803a733d05320993624


                                    const calculerPrixApresRemise = (item, typeRemise, valeurRemise) => {
                                      if (typeRemise === 'remiseFixe') {
                                        return item.prix; // Pas de changement au niveau des produits
                                      } else if (typeRemise === 'remiseParProduit') {
                                        return item.prix - (item.prix * (valeurRemise / 100));
                                      } else if (typeRemise === 'remiseGlobale') {
                                        return item.prix; // Pas de changement individuel sur les produits
                                      }
                                      return item.prix;
                                    };
                                    
                                    const calculerTotalApresRemise = (commande, typeRemise, valeurRemise, totalCommande) => {
                                      if (typeRemise === 'remiseFixe') {
                                        return totalCommande - valeurRemise;
                                      } else if (typeRemise === 'remiseParProduit') {
                                        return commande.reduce((total, item) => {
                                          const prixApresRemise = item.prix - (item.prix * (valeurRemise / 100));
                                          return total + (prixApresRemise * item.quantite);
                                        }, 0);
                                      } else if (typeRemise === 'remiseGlobale') {
                                        return totalCommande - (totalCommande * (valeurRemise / 100));
                                      }
                                      return totalCommande;
                                    };
                                    

<<<<<<< HEAD
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
        setTypeRemise(null);  // Réinitialise le type de remise à chaque changement de type
      }}
    >
      <option value="">Choisir un type</option>
      <option value="client">Client</option>
      <option value="commercial">Commercial</option>
    </select>
=======
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
                  {type === "client" && remisesClient && typeRemise && (
                  <div className="remises-info mt-3 m-2">
                    <h6>Type de remise du client :</h6>
                    {typeRemise === "remiseGlobale" && <label>Remise Globale : {remisesClient.remiseGlobale}%</label>}
                    {typeRemise === "remiseFixe" && <label>Remise Fixe : {remisesClient.remiseFixe} Ariary</label>}
                    {typeRemise === "remiseParProduit" && <label>Remise par Produit : {remisesClient.remiseParProduit}%</label>}
                  </div>
                )}
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
                                                                  <select className="form-control">
                                                                    <option value="">Veillez selectionner l'unité</option>
                                                                    <option value=""></option>
                                                                  </select>    
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

  <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
    <table className="table table-bordered mt-2">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Quantité</th>
          <th>Unité</th>
          <th>Prix Unitaire</th>
          <th>Prix Unitaire après remise</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td> Ariary</td>
            <td> Ariary</td>
            <td> Ariary</td>
          </tr>
      </tbody>
    </table>
>>>>>>> d197f132c72cd2305e34f803a733d05320993624
  </div>

<<<<<<< HEAD
  <h6 className="total">
    Total:  Ariary
  </h6>
  <h6 className="total">
    Total après remise:  Ariary
  </h6>
  <button className="btn btn-success mt-3" >
    Enregistrer la Commande
  </button>
</div>
=======
      
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
>>>>>>> 851597ff1b822f690460046e62431763bcf84eaf


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
                    {type === "client" && remisesClient && typeRemise && (
                    <div className="remises-info mt-3 m-2">
                      <h6>Type de remise du client :</h6>
                      {typeRemise === "remiseGlobale" && <label>Remise Globale : {remisesClient.remiseGlobale}%</label>}
                      {typeRemise === "remiseFixe" && <label>Remise Fixe : {remisesClient.remiseFixe} Ariary</label>}
                      {typeRemise === "remiseParProduit" && <label>Remise par Produit : {remisesClient.remiseParProduit}%</label>}
                    </div>
                  )}
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
      {searchTerm.trim() ? (
        produitsFiltres.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center">Aucun produit trouvé</td>
          </tr>
        ) : (
          produitsFiltres.map((p) => {
            const uniteActuelle = p.unites.find((u) => u.nom === (uniteSelectionnee[p._id] || p.unites[0]?.nom));
            const prixVente = uniteActuelle && uniteActuelle.prixdevente !== undefined
              ? Math.round(uniteActuelle.prixdevente)
              : "N/A";

            return (
              <tr key={p._id}>
                <td className="margin-left-mobile">{p.nom}</td>
                <td className="margin-left-mobile">{p.categorie}</td>
                <td className="margin-left-mobile">{prixVente} Ariary</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={p.quantiteTemp || 1}
                    className="form-control"
                    onChange={(e) => handleQuantiteChange(p, e)}
                    onKeyDown={(e) => handleKeyDown(p, e)}
                  />
                </td>
                <td>
                  <select
                    className="form-control"
                    value={uniteSelectionnee[p._id] || p.unites[0]?.nom}
                    onChange={(e) => handleChangeUnite(p, e.target.value)}
                  >
                    <option value="">Sélectionner unité</option>
                    {p.unites.map((unite) => (
                      <option key={unite.nom} value={unite.nom}>
                        {unite.nom}
                      </option>
                    ))}
                  </select>
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
            );
          })
        )
      ) : (
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

    <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
      <table className="table table-bordered mt-2">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Quantité</th>
            <th>Unité</th>
            <th>Prix Unitaire</th>
            <th>Prix Unitaire après remise</th>
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
              <td>{calculerPrixApresRemise(item, typeRemise, valeurRemise)} Ariary</td>
              <td>{item.quantite * calculerPrixApresRemise(item, typeRemise, valeurRemise)} Ariary</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <h6 className="total">
      Total: {totalCommande} Ariary
    </h6>
    <h6 className="total">
      Total après remise: {calculerTotalApresRemise(commande, typeRemise, valeurRemise, totalCommande)} Ariary
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

<<<<<<< HEAD
  export default PriseCommande;
=======
export default PriseCommande;
>>>>>>> d197f132c72cd2305e34f803a733d05320993624
