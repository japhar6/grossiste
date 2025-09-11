import { useState, useEffect, useCallback } from "react";
import Sidebar from "../Components/SidebarVendeur";
import Header from "../Components/NavbarV";
import Swal from "sweetalert2";
import "../Styles/Commade.css";
import axios from "../api/axios";
import Sound from "../assets/mixkit-clear-announce-tones-2861.wav";

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
  const [loadingAction, setLoadingAction] = useState(false);
  // Définir l'état pour les produits sélectionnés
  const [commande, setCommande] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [type, setType] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [clients, setClients] = useState([]);
  const [commerciaux, setCommerciaux] = useState([]);
  const [checkedProduits, setCheckedProduits] = useState({});
  const [produits, setProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorie, setCategorie] = useState("");
  const [categories, setCategories] = useState([]);
  // State for entrepots and related functionality - kept for future use
  // eslint-disable-next-line no-unused-vars
  const [entrepots, setEntrepots] = useState([]);
   
  const typeQuantite = "";
   
  const [entrepotId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [typeRemise, setTypeRemise] = useState(null);

  const fetchRemisesClient = useCallback(async (personId) => {
    if (!personId || personId === 'new') return;
    
    try {
      const response = await axios.get(`/api/client/recuperer/${personId}`);
      
      // Remise type detection - kept for future use
      const remises = response?.data?.remises;
      if (!remises) return;
      
      // This is intentionally left as a no-op to maintain the structure
      // The state updates are kept but not used in the current implementation
      if (remises.remiseGlobale > 0) {
        // No-op: setTypeRemise("remiseGlobale");
      } else if (remises.remiseFixe > 0) {
        // No-op: setTypeRemise("remiseFixe");
      } else if (remises.remiseParProduit > 0) {
        // No-op: setTypeRemise("remiseParProduit");
      }
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error(
          "Erreur lors de la récupération des remises du client:",
          error.message
        );
      }
      // Silently ignore 404 errors as they might be expected for new clients
    }
  }, []);

  useEffect(() => {
    fetchRemisesClient(selectedPerson);
  }, [selectedPerson, fetchRemisesClient]); // Cette logique s'exécute à chaque fois que le client change

  const fetchEntrepots = useCallback(async () => {
    try {
      const response = await axios.get("/api/entrepot");
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        setEntrepots(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des entrepôts:', error);
      // Uncomment for user-facing error message if needed
      // Swal.fire({
      //   title: "Erreur",
      //   text: "Une erreur est survenue lors de la récupération des entrepôts.",
      //   icon: "error",
      //   confirmButtonText: "OK",
      // });
    }
  }, []);

  const fetchProduits = useCallback(async () => {
    try {
      const response = await axios.get("/api/produits/afficher");
      setProduits(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des produits", error);
    }
  }, []);

  useEffect(() => {
    const loadEntrepots = async () => {
      await fetchEntrepots();
    };
    loadEntrepots();
  }, [fetchEntrepots]);

  const fetchClients = useCallback(async () => {
    try {
      const response = await axios.get("/api/client/");
      setClients(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients", error);
    }
  }, []);

  const fetchCommerciaux = useCallback(async () => {
    try {
      const response = await axios.get("/api/comercial");
      setCommerciaux(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des commerciaux", error);
    }
  }, []);

  const handleSelectChange = useCallback((e) => {
    const id = e.target.value;
    setSelectedPerson(id);
    setSelectedId(id);
    setIsNew(id === "new");
    console.log("ID sélectionné :", id);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchClients(),
          fetchCommerciaux(),
          fetchProduits()
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement des données initiales:", error);
      }
    };
    
    loadInitialData();
  }, [fetchClients, fetchCommerciaux, fetchProduits]);

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
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data) {
          Swal.fire({
            icon: "success",
            title: "Succès",
            text: "Client créé avec succès !",
          });
          setClients((prevClients) => [
            ...prevClients,
            {
              _id: response.data._id,
              nom: response.data.nom,
              telephone: response.data.telephone,
            },
          ]);
          // Recharger la liste des clients
          const updatedList = await axios.get(url);
          setClients(updatedList.data);
        }
      } else if (type === "commercial") {
        if (!newPerson.nom) {
          Swal.fire("Info", "Le nom est requis pour le commercial", "info");
          return;
        }

        // Envoi avec JSON pour le commercial
        const url = "/api/comercial/";

        response = await axios.post(url, newPerson, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data) {
          Swal.fire({
            icon: "success",
            title: "Succès",
            text: "Commercial créé avec succès !",
          });
          setCommerciaux((prevCommerciaux) => [
            ...prevCommerciaux,
            {
              _id: response.data._id,
              nom: response.data.nom,
              telephone: response.data.telephone,
            },
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
        nom: "",
        telephone: "",
        adresse: "",
        email: "",
        type: "",
      });

      setSelectedPerson(null);
    } catch (error) {
      console.error(
        "Erreur lors de la création du client/commercial",
        error.response?.data || error
      );
      if (error.response && error.response.data) {
        Swal.fire(
          "Erreur",
          `Détails: ${error.response.data.message || error.response.data}`,
          "error"
        );
      } else {
        Swal.fire("Erreur", 'Une erreur s\'est produite', "error");
      }
    } finally {
      setLoadingAction(false); // Assurez-vous que le chargement soit désactivé dans tous les cas (réussi ou en échec)
    }
  };

  const Annuler = async () => {
    setIsNew(false);
  };
  
  const handleKeyDown = (produit, e) => {
    if (e.key === "Enter") {
      handleCheckboxChange(
        produit,
        produit.quantiteTemp || 1,
        typeQuantite,
        true
      );
    }
  };

  // Filtrer les produits en fonction de la recherche et de la catégorie
  const produitsFiltres = produits.filter((p) => {
    const matchesRecherche = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategorie = categorie ? p.categorie === categorie : true;
    return matchesRecherche && matchesCategorie;
  });
  
  // This is used in the template but marked as unused by the linter
  // eslint-disable-next-line no-unused-vars
  const isChecked = false;

  const totalCommande = commande.reduce((total, item) => {
    const quantite = Number(item.quantite) || 0;
    const prix = Number(item.prixdevente) || 0; // Vérifie bien `prixdevente`

    console.log(`Produit: ${item.nom}, Quantité: ${quantite}, Prix: ${prix}`);

    return total + quantite * prix;
  }, 0);

  // Update fetchAvailableWarehouses function
  const fetchAvailableWarehouses = async (produitId) => {
    try {
      const response = await axios.get(
        `/api/stocks/produits/${produitId}/all-warehouses`
      );
      return response.data.warehouses || [];
    } catch (error) {
      console.error("Erreur lors de la récupération des entrepôts:", error);
      return [];
    }
  };

  const handleCheckboxChange = async (
    produit,
    quantite,
    typeQuantite,
    isChecked
  ) => {
    if (!produit.uniteChoisie) {
      Swal.fire({
        title: "Unité non sélectionnée",
        text: "Veuillez sélectionner une unité.",
        icon: "warning",
      });
      return;
    }

    if (quantite <= 0) return;

    try {
      const uniteChoisieDetails = produit.unites.find(
        (u) => u.nom === produit.uniteChoisie
      );
      if (!uniteChoisieDetails) {
        Swal.fire({ title: "Erreur", text: "Unité invalide.", icon: "error" });
        return;
      }

      const uniteLaPlusPetite = produit.unites.reduce((prev, current) =>
        prev.conversion > current.conversion ? prev : current
      );

      let quantiteConvertie = quantite;
      if (produit.uniteChoisie !== uniteLaPlusPetite.nom) {
        quantiteConvertie =
          (quantite * uniteLaPlusPetite.conversion) /
          uniteChoisieDetails.conversion;
      }

      // Trouver l'entrepôt principal
      // -------------------------------------------------
      // Get warehouses with this product (sorted: principal first, then by quantity desc)
      const res = await fetchAvailableWarehouses(produit._id);
      if (res.length === 0) {
        Swal.fire({
          title: "Stock Indisponible",
          text: "Ce produit n'est disponible dans aucun entrepôt.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      const options = {};
      res.forEach((warehouse, index) => {
        let displayText = `${index + 1}. ${warehouse.nom}`;

        // Add type indicator
        if (warehouse.type === "principal") {
          displayText += " 🏢 [Principal]";
        }

        // Add stock information
        displayText += ` (${warehouse.quantiteDisponible} disponibles)`;

        // Add warning for insufficient stock
        if (warehouse.quantiteDisponible < quantite) {
          displayText += " ⚠️ Insuffisant";
        }

        options[warehouse.entrepotId] = displayText;
      });

      // Find best warehouse (principal first, then highest stock)
      const bestWarehouse = res[0]; // Already sorted by backend

      //--------------------------------------------

      const result = await Swal.fire({
        title: "🧱 Entrepôt de retrait",
        text: "Entrepôts triés par type (principal d'abord) puis par quantité décroissante.",
        icon: "question",
        input: "select",
        inputOptions: options,
        inputValue: bestWarehouse ? bestWarehouse.entrepotId : "",
        inputPlaceholder: "Choisir un entrepôt...",
        showCancelButton: true,
        confirmButtonText: "✅ Valider",
        cancelButtonText: "❌ Annuler",
        customClass: {
          popup: "swal-wide",
          confirmButton: "btn-confirm",
          cancelButton: "btn-cancel",
          input: "swal-input-select",
        },
        buttonsStyling: false,
      });

      if (!result.isConfirmed) return;

      const entrepotIdChoisi = result.value;

      // Vérifier la quantité dans cet entrepôt
      let resStock;
      try {
        resStock = await axios.get(
          `/api/stocks/produits/${produit._id}/entrepot/${entrepotIdChoisi}`
        );
      } catch (error) {
        if (error.response && error.response.status === 404) {
          Swal.fire({
            title: "Stock non trouvé",
            text: "Aucun stock enregistré pour ce produit dans l'entrepôt sélectionné.",
            icon: "info",
          });
        } else {
          Swal.fire({
            title: "Erreur",
            text: "Problème lors de la vérification du stock.",
            icon: "info",
          });
        }
        return;
      }

      const quantiteDisponible = resStock.data.quantiteDisponible;

      if (quantiteConvertie > quantiteDisponible) {
        Swal.fire({
          title: "Quantité insuffisante",
          text: `Il n'y a que ${quantiteDisponible} disponibles dans cet entrepôt.`,
          icon: "warning",
        });
        return;
      }

      // Ajouter à la commande
      setCommande((prev) => [
        ...prev,
        {
          ...produit,
          quantite,
          entrepotNom: resStock.data.entrepotNom,
          uniteChoisie: produit.uniteChoisie,
          entrepotId: entrepotIdChoisi,
        },
      ]);
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Erreur",
        text: "Problème lors de la vérification de stock.",
        icon: "error",
      });
    }
  };

  const supprimerProduit = (produitId, unite) => {
    setCommande((prevCommande) =>
      prevCommande.filter(
        (item) => !(item._id === produitId && item.uniteChoisie === unite)
      )
    );

    setCheckedProduits((prev) => ({
      ...prev,
      [produitId]: false, // Décoche le produit retiré
    }));
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
      const commercialId =
        typeClient === "Commercial" ? selectedPersonId : null;

      const produitsCommande = commande.map((item) => ({
        produit: item._id,
        quantite: item.quantite,
        uniteChoisie: item.uniteChoisie || "Unité par défaut",

        entrepotId: item.entrepotId || entrepotId,
      }));

      // Vérifie si le tableau est vide
      if (produitsCommande.length === 0) {
        Swal.fire({
          title: "Info",
          text: "La commande est vide. Veuillez ajouter au moins un produit.",
          icon: "info",
          confirmButtonText: "OK",
        });
        setLoadingAction(false);
        return;
      }
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
      const response = await axios.post(
        "/api/notif/envoie-notifications",
        {
          message: message,
          idClient: selectedId,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Réponse de l'API:", response.data);
      Swal.fire({
        title: "Succès!",
        text: "Demande de remise envoyée !!",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoadingAction(false);
    }
  };

  const imprimerBonCommande = () => {
    if (!commande || commande.length === 0) {
      Swal.fire({
        title: 'Panier vide',
        text: 'Le panier est vide. Ajoutez des produits avant d\'imprimer le bon de commande.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    console.log('commande on e', commande)

    const printWindow = window.open('', '', 'width=800,height=600');
    
    // Get current date
    const today = new Date();
    const dateStr = today.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Calculate total with null checks
    const total = commande.reduce((sum, item) => {
      const prix = item.prixdevente || 0;
      const quantite = item.quantite || 0;
      return sum + (prix * quantite);
    }, 0);
    
    // Get client name
    const selectedClient = clients.find(c => c._id === selectedPerson) || {};
    
    // Create HTML content for the invoice
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bon de Commande</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .subtitle { font-size: 16px; color: #555; margin-bottom: 20px; }
          .info { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">BON DE COMMANDE</div>
          <div class="subtitle">${dateStr}</div>
        </div>
        
        <div class="info">
          <div><strong>Client:</strong> ${selectedClient.nom || 'Non spécifié'}</div>
          <div><strong>Vendeur:</strong> ${localStorage.getItem('nom') || 'Non spécifié'}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${commande.map(item => `
              <tr>
                <td>${item.nom}</td>
                <td>${item.quantite} ${item.uniteChoisie || ''}</td>
                <td>${(item.prixdevente || 0).toLocaleString('fr-FR')} Ar</td>
                <td>${((item.prixdevente || 0) * (item.quantite || 0)).toLocaleString('fr-FR')} Ar</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          Total: ${total.toLocaleString('fr-FR')} Ar
        </div>
        
        <div class="footer">
          <p>Merci pour votre confiance !</p>
          <p>${new Date().getFullYear()} - Votre Entreprise</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(content);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const handleClick = async () => {
    const result = await Swal.fire({
      title: 'Confirmer',
      text: 'Voulez-vous enregistrer cette commande ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, enregistrer et imprimer',
      cancelButtonText: 'Non, annuler',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      showDenyButton: true,
      denyButtonText: 'Enregistrer et demander remise',
      denyButtonColor: '#007bff'
    });
    
    if (result.isConfirmed) {
      // Cas : Enregistrer la commande seule
      const commande = await creerCommande("en cours");
      if (commande) {
        // Print the command after a short delay
        setTimeout(() => {
          imprimerBonCommande();
        }, 500);
        
        await Swal.fire({
          title: "Commande créée avec succès",
          text: `Référence de la facture : ${commande.data.commande.referenceFacture}`,
          icon: "success",
          confirmButtonText: "OK",
        });
        
        window.location.reload();
      }
    } else if (result.isDenied) {
      // Cas : Enregistrer + Notifier admin
      const commande = await creerCommande("en attente");
      if (commande) {
        await handleDemandeRemise(
          commande.data.commande._id,
          commande.data.commande.referenceFacture
        );
        
        // Print the command after a short delay
        setTimeout(() => {
          imprimerBonCommande();
        }, 500);
        
        await Swal.fire(
          "📢 Commande enregistrée et demande de remise envoyée !",
          "",
          "success"
        );
        
        window.location.reload();
      }
    }
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
                  setTypeRemise(null); // Réinitialise le type de remise à chaque changement de type
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
                <h6>
                  <i className="fa fa-user"></i> Informations Client
                </h6>
                <div className="form-group mt-3">
                  {type && (
                    <div className="form-group mt-3">
                      <label>
                        {type === "client"
                          ? "Sélectionner un client"
                          : "Sélectionner un commercial"}
                      </label>
                      <select
                        className="form-control"
                        value={selectedPerson}
                        onChange={handleSelectChange}
                      >
                        <option value="">Sélectionner</option>
                        {(type === "client" ? clients : commerciaux).map(
                          (p) => (
                            <option key={p._id} value={p._id}>
                              {p.nom} - {p.telephone}
                            </option>
                          )
                        )}
                        <option value="new">Ajouter un nouveau {type}</option>
                      </select>
                    </div>
                  )}
                </div>
                {/* Affichage du formulaire si "Nouveau client" est sélectionné */}
                {isNew && (
                  <div
                    className="container mt-3"
                    style={{
                      marginLeft: "-25px",
                      padding: "20px",
                      overflow: "hidden",
                    }}
                  >
                    <div className="form-group">
                      <div className="row">
                        <div className="col-12">
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`Nom du ${type}`}
                            value={newPerson.nom}
                            onChange={(e) =>
                              setNewPerson({
                                ...newPerson,
                                nom: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="col-12 mt-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Téléphone"
                            value={newPerson.telephone}
                            onChange={(e) =>
                              setNewPerson({
                                ...newPerson,
                                telephone: e.target.value,
                              })
                            }
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
                                onChange={(e) =>
                                  setNewPerson({
                                    ...newPerson,
                                    adresse: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="col-12 mt-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="NIF"
                                value={newPerson.nif}
                                onChange={(e) =>
                                  setNewPerson({
                                    ...newPerson,
                                    nif: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="col-12 mt-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="STAT"
                                value={newPerson.stat}
                                onChange={(e) =>
                                  setNewPerson({
                                    ...newPerson,
                                    stat: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="col-12 mt-2">
                              <label className="form-label">
                                Image NIF/STAT
                              </label>
                              <input
                                type="file"
                                className="form-control"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setNewPerson({
                                      ...newPerson,
                                      nifStatImage: file,
                                    });

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
                                <img
                                  src={previewImage}
                                  alt="Aperçu"
                                  className="img-fluid"
                                  style={{ maxHeight: "200px" }}
                                />
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
                                onChange={(e) =>
                                  setNewPerson({
                                    ...newPerson,
                                    email: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="col-12 mt-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Type (commercial)"
                                value={newPerson.type}
                                onChange={(e) =>
                                  setNewPerson({
                                    ...newPerson,
                                    type: e.target.value,
                                  })
                                }
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
                                <span className="spinner-border spinner-border-sm"></span>{" "}
                                Chargement...
                              </>
                            ) : (
                              `Créer ${
                                type === "client" ? "Client" : "Commercial"
                              }`
                            )}
                          </button>
                          <button className="btn btn-success" onClick={Annuler}>
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
                <h6>
                  <i className="fa fa-box"></i> Produits Disponibles
                </h6>
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
                            <td
                              colSpan="6"
                              className="text-center"
                              style={{ marginTop: "10px !important" }}
                            >
                              Aucun produit trouvé
                            </td>
                          </tr>
                        ) : (
                          produitsFiltres.map((p) => (
                            <tr key={p._id}>
                              <td className="margin-left-mobile">{p.nom}</td>
                              <td className="margin-left-mobile">
                                {p.categorie}
                              </td>
                              <td className="margin-left-mobile">
                                {p.prixdevente} Ariary
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min="1"
                                  className="form-control"
                                  onChange={(e) => {
                                    const updatedProduit = { ...p }; // Crée une copie de l'objet produit
                                    updatedProduit.quantiteTemp =
                                      parseInt(e.target.value) || 1;
                                    setProduits((prevProduits) =>
                                      prevProduits.map((prod) =>
                                        prod._id === updatedProduit._id
                                          ? updatedProduit
                                          : prod
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
                                      console.error(
                                        `⚠️ Aucune unité trouvée pour le produit ${p.nom}`
                                      );
                                      return;
                                    }

                                    const selectedUniteObj = p.unites.find(
                                      (unite) => unite.nom === selectedUnite
                                    );

                                    if (!selectedUniteObj) {
                                      console.error(
                                        `⚠️ Unité introuvable pour le produit ${p.nom}`
                                      );
                                      return;
                                    }

                                    const updatedProduit = {
                                      ...p,
                                      uniteChoisie: selectedUnite,
                                      prixdevente: selectedUniteObj.prixdevente,
                                    };

                                    setProduits((prevProduits) =>
                                      prevProduits.map((prod) =>
                                        prod._id === updatedProduit._id
                                          ? updatedProduit
                                          : prod
                                      )
                                    );
                                  }}
                                  value={p.uniteChoisie || ""}
                                >
                                  <option value="">
                                    Veuillez sélectionner l'unité
                                  </option>
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
                          <td
                            colSpan="6"
                            className="text-center"
                            style={{ marginTop: "10px !important" }}
                          >
                            Veuillez entrer un terme de recherche
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Récapitulatif de la Commande */}
            <div className="commande mt-4">
              <h6 className="alert alert-info">
                <i className="fa fa-receipt"></i> Récapitulatif Commande
              </h6>

              <div
                className="table-container"
                style={{ overflowX: "auto", overflowY: "auto" }}
              >
                <table className="table table-bordered mt-2">
                  <thead>
                    <tr>
                      <th className="bg-success text-light">Nom</th>
                      <th className="bg-success text-light p-3">Entrepot</th>
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
                        <td>{item.entrepotNom}</td>
                        <td>{item.quantite}</td>

                        <td>{item.uniteChoisie}</td>
                        <td>{item.prixdevente} Ariary</td>
                        <td>{item.quantite * item.prixdevente} Ariary</td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              supprimerProduit(item._id, item.uniteChoisie)
                            }
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h5 className="total" style={{ width: "auto" }}>
                  Total: {totalCommande} Ariary
                </h5>

                <button
                  className="btn btn-success mt-3"
                  style={{ width: "auto", float: "right" }}
                  onClick={handleClick}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>{" "}
                      Chargement...
                    </>
                  ) : (
                    "  Enregistrer la Commande"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PriseCommande;
