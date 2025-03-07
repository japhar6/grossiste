import React, { useState, useEffect } from "react";
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
    nif: "",
    stat: "",
    nifStatImage: null, // Stocke l'image
  });

  const [previewImage, setPreviewImage] = useState(null); // Pour l'aperçu de l'image

  const playSound = () => {
    const audio = new Audio(Sound);
    audio.play();
  };
  const [loadingEntrepots, setLoadingEntrepots] = useState(false);
  const [loadingMagasiniers, setLoadingMagasiniers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [nompricipal, setnomprincipal] = useState([]);
  const [nomcondaire, setnomsecondaire] = useState([]);
  // Définir l'état pour les produits sélectionnés
  const [commande, setCommande] = useState([]);
  const [typeQuantite, setTypeQuantite] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [type, setType] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [clients, setClients] = useState([]);
  const [commerciaux, setCommerciaux] = useState([]);
  const [checkedProduits, setCheckedProduits] = useState({});
  const [produits, setProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entrepotId, setEntrepotId] = useState(null); // Initialisation de l'état pour l'ID de l'entrepôt
  const [uniteChoisieDetails, setUniteChoisieDetails] = useState(null);
  const [categorie, setCategorie] = useState("");
  const [categories, setCategories] = useState([]);
  const [remisesClient, setRemisesClient] = useState(null);
  const [typeRemise, setTypeRemise] = useState(null); // Ajouté pour stocker le type de remise
  const [produitsDesactives, setProduitsDesactives] = useState({}); // {idProduit: true/false}

  useEffect(() => {
    const fetchRemisesClient = async () => {
      if (selectedPerson) {
        try {
          const response = await axios.get(`/api/client/recuperer/${selectedPerson}`);

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
      const response = await axios.get("/api/client/");
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

  const creerPersonne = async () => {
    setLoadingAction(true);
    try {
      // Vérification des données envoyées
      console.log("Données envoyées :", newPerson);

      let response; // Déclare la variable response ici pour l'utiliser plus tard

      // Validation des champs selon le type (client ou commercial)
      if (type === "client") {
        if (!newPerson.nom) {
          Swal.fire("Info", "Le nom est requis pour le client", "info");
          return;
        }

        // Envoi avec FormData pour le client
        const formData = new FormData();
        for (const key in newPerson) {
          formData.append(key, newPerson[key]);
        }

        // Afficher les données dans le formData pour vérifier
        for (const [key, value] of formData.entries()) {
          console.log(key, value);
        }

        const url = "/api/client/";

        response = await axios.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.data) {
          Swal.fire({
            icon: "success",
            title: "Succès",
            text: "Client créé avec succès !",
          });
          setClients((prevClients) => [
            ...prevClients,
            { _id: response.data._id, nom: response.data.nom, telephone: response.data.telephone }
          ]);
          // Recharger la liste des clients
          const updatedList = await axios.get(url);
          setClients(updatedList.data);
        }
      } else if (type === "commercial") {
        if (!newPerson.nom ) {
          Swal.fire("Info", "Le nom est requis pour le commercial", "info");
          return;
        }

        // Envoi avec JSON pour le commercial
        const url = "/api/comercial/";

        response = await axios.post(url, newPerson, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log(response.data);
        if (response.data) {
          Swal.fire({
            icon: "success",
            title: "Succès",
            text: "Commercial créé avec succès !",
          });
          setCommerciaux((prevCommerciaux) => [
            ...prevCommerciaux,
            { _id: response.data._id, nom: response.data.nom, telephone: response.data.telephone }
          ]);
          // Recharger la liste des commerciaux
          const updatedList = await axios.get(url);
          setCommerciaux(updatedList.data);
        }
      }

      if (response && response.data) {
        setSelectedPerson(response.data._id);
        setIsNew(false);
      }

      // Reset les champs de saisie
      setNewPerson({
        nom: '',
        telephone: '',
        adresse: '',
        email: '',
        type: '',
      });

      setSelectedPerson(null);

    } catch (error) {
      console.error("Erreur lors de la création du client/commercial", error.response?.data || error);
      if (error.response && error.response.data) {
        Swal.fire("Erreur", `Détails: ${error.response.data.message || error.response.data}`, "error");
      } else {
        Swal.fire("Erreur", "Une erreur s'est produite", "error");
      }
    } finally {
      setLoadingAction(false); // Assurez-vous que le chargement soit désactivé dans tous les cas (réussi ou en échec)
    }
  };




  const Annuler = async () => {

    setIsNew(false);
  }
  const handleKeyDown = (produit, e) => {
    if (e.key === "Enter") {
      handleCheckboxChange(produit, produit.quantiteTemp || 1, typeQuantite, true);
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
  const convertirQuantiteEnUniteSelectionnee = (produitId, nouvelleUnite, quantitesInitiales) => {
    // Recherche du produit
    const produit = stocks.find(stock => stock.produit._id === produitId);
    if (!produit) return 0; // Si le produit n'est pas trouvé, retourne 0

    // Trouver les unités
    const uniteSelectionneeProduit = produit.produit.unites.find(unite => unite.nom === nouvelleUnite);
    const uniteStockProduit = produit.produit.unites.find(unite => unite.nom === produit.unite);

    if (!uniteSelectionneeProduit || !uniteStockProduit) return 0; // Vérifier que les unités existent

    // Récupérer la quantité initiale en fonction du produit
    const quantiteStock = quantitesInitiales[produitId];
    if (quantiteStock === undefined || quantiteStock <= 0) return 0; // Vérifier que la quantité est valide

    // Calcul de la conversion entre les unités
    const conversion = uniteStockProduit.conversion / uniteSelectionneeProduit.conversion;

    // Conversion de la quantité
    const nouvelleQuantite = quantiteStock / conversion;

    return nouvelleQuantite;
  };


  const totalCommande = commande.reduce((total, item) => {
    const quantite = Number(item.quantite) || 0;
    const prix = Number(item.prixdevente) || 0; // Vérifie bien `prixdevente`

    console.log(`Produit: ${item.nom}, Quantité: ${quantite}, Prix: ${prix}`);

    return total + quantite * prix;
  }, 0);

  

  const handleCheckboxChange = async (produit, quantite, typeQuantite, isChecked) => {
   
    // Vérifier si une unité est choisie
    if (!produit.uniteChoisie) {
      Swal.fire({
        title: 'Unité non sélectionnée',
        text: 'Veuillez sélectionner une unité avant d\'ajouter ce produit.',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return; // Ne rien faire si l'unité n'est pas sélectionnée
    }

    // Ne rien faire si la quantité demandée est inférieure ou égale à 0
    if (quantite <= 0) return;

    try {
       // Trouver l'unité choisie
  // Trouver l'unité choisie dans la liste des unités du produit
const uniteChoisieDetails = produit.unites.find(u => u.nom === produit.uniteChoisie);

if (!uniteChoisieDetails) {
  console.error("Unité choisie introuvable pour le produit :", produit.nom);
  Swal.fire({
    title: 'Erreur',
    text: `L'unité sélectionnée (${produit.uniteChoisie}) n'existe pas pour ce produit.`,
    icon: 'error',
    confirmButtonText: 'OK',
  });
  return; // Sortir de la fonction pour éviter une erreur
}


     // Trouver l'unité avec la plus petite conversion
    const uniteLaPlusPetite = produit.unites.reduce((prev, current) => 
      prev.conversion > current.conversion ? prev : current
    );
    console.log(`Unité la plus petite : ${uniteLaPlusPetite.nom}, conversion : ${uniteLaPlusPetite.conversion}`);


     
      
      // Si l'unité choisie n'est pas l'unité la plus petite, on effectue la conversion
      let quantiteConvertie = quantite;
      if (produit.uniteChoisie !== uniteLaPlusPetite.nom) {
        quantiteConvertie = (quantite * uniteLaPlusPetite.conversion)/uniteChoisieDetails.conversion;
        console.log(`Quantité convertie : ${quantite}  ${produit.uniteChoisie} =   ${quantiteConvertie} ${uniteLaPlusPetite.nom}`);
      } else {
        console.log(`Aucune conversion nécessaire, l'unité choisie est déjà la plus petite.`);
      }

      // Récupérer la quantité disponible dans l'entrepôt principal
      const responsePrincipal = await axios.get(`/api/stocks/produits/quantite/${produit._id}`);
      const quantiteDisponiblePrincipal = responsePrincipal.data.quantiteDisponible;
      const entrepotIdPrincipal = responsePrincipal.data.entrepotId;
      const nomPrincipal = responsePrincipal.data.entrepotNom;  // Récupérer le nom de l'entrepôt principal
      console.log("nom principal", nomPrincipal);
      console.log(`Quantité disponible dans l'entrepôt principal : ${quantiteDisponiblePrincipal}`);

      // Comparer la quantité convertie avec la quantité disponible
      if (isChecked) {
        if (quantiteConvertie > quantiteDisponiblePrincipal) {
          // Si la quantité est insuffisante dans l'entrepôt principal
          const result = await Swal.fire({
            title: 'Quantité Insuffisante',
            text: `Il n'en reste que (${quantiteDisponiblePrincipal}) dans l'entrepôt principal .`,
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
            // Si l'utilisateur veut choisir un autre entrepôt, essayer l'entrepôt secondaire
            const responseSecondaire = await axios.get(`/api/stocks/produits/quantita/${produit._id}`);
            const quantiteDisponibleSecondaire = responseSecondaire.data.quantiteDisponible;
            const entrepotIdSecondaire = responseSecondaire.data.entrepotId;
            const nomSecondaire = responseSecondaire.data.entrepotsecondaireNom || " ";
            console.log("nom secondaire", nomSecondaire);
            console.log(`Quantité disponible dans l'entrepôt secondaire : ${quantiteDisponibleSecondaire}`);

            // Vérifier la quantité dans l'entrepôt secondaire
            if (quantiteConvertie <= quantiteDisponibleSecondaire) {
     
              // Ajouter le produit avec l'entrepôt secondaire
              setCommande((prevCommande) => {
                return [...prevCommande, {
                  ...produit,
                  quantite,
                  uniteChoisie: produit.uniteChoisie,
                  entrepotId: responseSecondaire.data.entrepotId, // Entrepôt secondaire
                }];
              });
            } else {
              // Si la quantité est insuffisante dans les deux entrepôts
              Swal.fire({
                title: 'Quantité Insuffisante',
                text: `La quantité est insuffisante dans l'entrepôt secondaire aussi.`,
                icon: 'warning',
                confirmButtonText: 'OK',
              });
            }
          }
        } else {
       
          // Ajouter le produit avec l'entrepôt principal
          setCommande((prevCommande) => {
            return [...prevCommande, {
              ...produit,
              quantite,
              uniteChoisie: produit.uniteChoisie,
              entrepotId: entrepotIdPrincipal, // Entrepôt principal
            }];
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la quantité disponible", error);
    }
  };


  const supprimerProduit = (produitId, unite) => {
    setCommande((prevCommande) =>
      prevCommande.filter((item) => !(item._id === produitId && item.uniteChoisie === unite))
    );

    setCheckedProduits((prev) => ({
      ...prev,
      [produitId]: false, // Décoche le produit retiré
    }));
  };

  const getClientNom = (id) => {
    const client = clients.find(client => client._id === id);
    return client ? client.nom : '';
    };
    const creerCommande = async (statut) => {
      setLoadingAction(true);
      try {
        const vendeurId = localStorage.getItem("userid");
        const selectedPersonId = selectedPerson;
    
        if (!selectedPersonId) {
          Swal.fire({
            title: "Info",
            text: "Aucun client ou commercial sélectionné.",
            icon: "info",
            confirmButtonText: "OK",
          });
          return;
        }
    
        if (!vendeurId) {
          Swal.fire({
            title: "Erreur",
            text: "ID du vendeur non trouvé.",
            icon: "error",
            confirmButtonText: "OK",
          });
          setLoadingAction(false);
          return;
        }
    
        const typeClient = type === "client" ? "Client" : "Commercial";
        const clientId = typeClient === "Client" ? selectedPersonId : null;
        const commercialId = typeClient === "Commercial" ? selectedPersonId : null;
    
        const produitsCommande = commande.map((item) => ({
          produit: item._id,
          quantite: item.quantite,
          uniteChoisie: item.uniteChoisie || "Unité par défaut",
          entrepotId: item.entrepotId || entrepotId,
        }));
    
        const commandeData = {
          typeClient,
          clientId,
          commercialId,
          vendeurId,
          produits: produitsCommande,
          statut, // Utilisation du statut passé en paramètre
        };
    
        const response = await axios.post("/api/commandes/ajouter", commandeData);
        console.log("Commande créée avec succès:", response.data); 
          const { _id, referenceFacture } = response.data.commande;
          playSound();
          Swal.fire({
            title: "Commande créée avec succès",
            text: `Référence de la facture : ${response.data.commande.referenceFacture}`,
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            window.location.reload(); // Recharge la page après le clic sur OK
          });
          
        setCommande([]);
    
        return { commandeId: _id, referenceFacture }; // Retourne l'ID de la commande créée
    
      } catch (error) {
        console.error("Erreur lors de la création de la commande:", error);
        Swal.fire({
          title: "Erreur",
          text: "Une erreur s'est produite lors de la création de la commande.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return null;
      } finally {
        setLoadingAction(false);
      }
    };
    
    
    const vendeurNom = localStorage.getItem("nom");
    
    const handleDemandeRemise = async (commandeId, referenceFacture) => {
      setLoadingAction(true);
    
      if (!vendeurNom) {
        alert("Nom du vendeur non trouvé dans localStorage.");
        return;
      }
    
      const message = `Le vendeur ${vendeurNom} demande une remise pour la commande  (Facture: ${referenceFacture}) .`;
    
      try {
        const response = await axios.post("/api/notif/envoie-notifications", {
          message: message,
          idClient: selectedId,
        }, {
          headers: { "Content-Type": "application/json" },
        });
    
        console.log("Réponse de l'API:", response.data);
        Swal.fire({
          title: 'Succès!',
          text: 'Demande de remise envoyée !',
          icon: 'success',
          confirmButtonText: 'OK',
        });
    
      } catch (error) {
        console.error("Erreur lors de l'envoi de la notification", error);
        alert("Une erreur est survenue. Veuillez réessayer.");
      } finally {
        setLoadingAction(false);
      }
    };

    const handleClick = async () => {
      Swal.fire({
        title: "Que souhaitez-vous faire ?",
        text: "Vous pouvez enregistrer la commande seule ou notifier l'admin pour une remise.",
        icon: "question",
        showCancelButton: true,
        showDenyButton: true, // Ajoute un deuxième bouton
        confirmButtonText: "✅ Enregistrer",
        denyButtonText: "📢 Enregistrer et Demande remise",
        cancelButtonText: "❌ Annuler",
        confirmButtonColor: "#28a745",
        denyButtonColor: "#007bff",
        cancelButtonColor: "#d33",
      }).then(async (result) => { // Marquer cette fonction comme 'async'
        if (result.isConfirmed) {
          // Cas : Enregistrer la commande seule
          const commande = await creerCommande("en cours"); // Attendre la création de la commande
          if (commande) {
            Swal.fire({
              title: "Commande créée avec succès",
              text: `Référence de la facture : ${response.data.commande.referenceFacture}`,
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              window.location.reload(); // Recharge la page après le clic sur OK
            });
            ;playSound();
          }
        } else if (result.isDenied) {
          // Cas : Enregistrer + Notifier admin
          const commande = await creerCommande("en attente"); // Le statut devient "en attente"
          if (commande) {
            await handleDemandeRemise(commande.commandeId, commande.referenceFacture); // Attendre la demande de remise
            Swal.fire("📢 Commande enregistrée et demande de remise envoyée !", "", "success");playSound();
          }
        }
      });
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
                {/* Affichage du formulaire si "Nouveau client" est sélectionné */}
                {isNew && (
                  <div className="container mt-3" style={{ marginLeft: '-25px', padding: '20px', overflow: 'hidden' }}>
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


                          <>
                            <div className="col-12 mt-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Adresse"
                                value={newPerson.adresse}
                                onChange={(e) => setNewPerson({ ...newPerson, adresse: e.target.value })}
                              />
                            </div>
                            <div className="col-12 mt-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="NIF"
                                value={newPerson.nif}
                                onChange={(e) => setNewPerson({ ...newPerson, nif: e.target.value })}
                              />
                            </div>
                            <div className="col-12 mt-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="STAT"
                                value={newPerson.stat}
                                onChange={(e) => setNewPerson({ ...newPerson, stat: e.target.value })}
                              />
                            </div>
                            <div className="col-12 mt-2">
                              <label className="form-label">Image NIF/STAT</label>
                              <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setNewPerson({ ...newPerson, nifStatImage: file });

                                    // Prévisualisation de l'image
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setPreviewImage(reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                            {previewImage && (
                              <div className="col-12 mt-2">
                                <img src={previewImage} alt="Aperçu" className="img-fluid" style={{ maxHeight: "200px" }} />
                              </div>
                            )}
                          </>

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
                            disabled={loadingAction}
                          >
                            {loadingAction ? (
                              <>
                                <span className="spinner-border spinner-border-sm"></span> Chargement...
                              </>
                            ) : (
                              `Créer ${type === "client" ? "Client" : "Commercial"}`
                            )}

                          </button>
                          <button
                            className="btn btn-success"
                            onClick={Annuler}
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
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
                        <th className="bg-success text-light p-3">Nom</th>
                        <th className="bg-success text-light p-3">Type</th>
                        <th className="bg-success text-light p-3">Prix</th>
                        <th className="bg-success text-light p-3">Quantité</th>
                        <th className="bg-success text-light p-3">Unité</th>
                        <th className="bg-success text-light p-3">Ajouter</th>
                      </tr>
                    </thead>
                    <tbody>

                      {searchTerm ? (

                        produitsFiltres.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center" style={{ marginTop: '10px !important' }}>Aucun produit trouvé</td>
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
                                  onChange={(e) => {
                                    const updatedProduit = { ...p };  // Crée une copie de l'objet produit
                                    updatedProduit.quantiteTemp = parseInt(e.target.value) || 1;
                                    setProduits((prevProduits) =>
                                      prevProduits.map((prod) =>
                                        prod._id === updatedProduit._id ? updatedProduit : prod
                                      )
                                    );
                                  }}
                                  onKeyDown={(e) => handleKeyDown(p, e)}
                                />
                              </td>
                              <td>
                                <select
                                  className="form-control"
                                  onChange={(e) => {
                                    const selectedUnite = e.target.value;

                                    if (!p.unites || p.unites.length === 0) {
                                      console.error(`⚠️ Aucune unité trouvée pour le produit ${p.nom}`);
                                      return;
                                    }

                                    const selectedUniteObj = p.unites.find((unite) => unite.nom === selectedUnite);

                                    if (!selectedUniteObj) {
                                      console.error(`⚠️ Unité introuvable pour le produit ${p.nom}`);
                                      return;
                                    }

                                    const updatedProduit = {
                                      ...p,
                                      uniteChoisie: selectedUnite,
                                      prixdevente: selectedUniteObj.prixdevente,
                                    };

                                    setProduits((prevProduits) =>
                                      prevProduits.map((prod) => (prod._id === updatedProduit._id ? updatedProduit : prod))
                                    );
                                  }}
                                  value={p.uniteChoisie || ""}
                                >
                                  <option value="">Veuillez sélectionner l'unité</option>
                                  {p.unites?.map((unite) => (
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
                          ))
                        )
                      ) : (
                        // Si searchTerm est vide, ne rien afficher
                        <tr>
                          <td colSpan="6" className="text-center" style={{ marginTop: '10px !important' }}>Veuillez entrer un terme de recherche</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Récapitulatif de la Commande */}
            <div className="commande mt-4">
              <h6 className="alert alert-info"><i className="fa fa-receipt"></i> Récapitulatif Commande</h6>

              <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                <table className="table table-bordered mt-2">
                  <thead>
                    <tr>
                      <th className="bg-success text-light">Nom</th>
                      <th className="bg-success text-light">Quantité</th>
                      <th className="bg-success text-light">Unité</th>
                      <th className="bg-success text-light">Prix Unitaire</th>
                      <th className="bg-success text-light">Total</th>
                      <th className="bg-success text-light">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commande.map((item, index) => (
                      <tr key={index}>
                        <td>{item.nom}</td>
                        <td>{item.quantite}</td>
                        <td>{item.uniteChoisie}</td>
                        <td>{item.prixdevente} Ariary</td>
                        <td>{item.quantite * item.prixdevente} Ariary</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => supprimerProduit(item._id, item.uniteChoisie)}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </td >
                      </tr >
                    ))
                    }
                  </tbody >
                </table >

                <h5 className="total" style={{ width: 'auto' }}>Total: {totalCommande} Ariary</h5>

                <button className="btn btn-success mt-3" style={{ width: 'auto', float: 'right' }}   onClick={handleClick} disabled={loadingAction}>

{loadingAction ? (
  <>
    <span className="spinner-border spinner-border-sm"></span> Chargement...
  </>
) : (
  "  Enregistrer la Commande"
)}
</button>
              </div >


        
             
            </div >

          </div >
        </div >
      </section >
    </main >
  );
}

export default PriseCommande;
