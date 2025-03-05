import React, { useState, useEffect } from "react";
import axios from '../api/axios';
import "../Styles/SortieStock.css";
import Sidebar from "../Components/SidebarMagasinier"; // Assurez-vous que ces imports sont corrects
import Header from "../Components/NavbarM";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Sound from "../assets/mixkit-clear-announce-tones-2861.wav"

function SortieStock() {
  const [commandes, setCommandes] = useState([]);
  const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientType, setClientType] = useState("");
  const [statutCommande, setStatutCommande] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // État pour mobile
  const [sortOrder, setSortOrder] = useState("desc");
  const [loadingEntrepots, setLoadingEntrepots] = useState(false);
  const [loadingMagasiniers, setLoadingMagasiniers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [entrepots, setEntrepots] = useState([]);
  const [entrepotSelectionne, setEntrepotSelectionne] = useState(null);
  const playSound = () => {
    const audio = new Audio(Sound);
    audio.play();
  };


  // Vérification de l'identité du magasinier
  const magasinierId = localStorage.getItem("userid");
  if (!magasinierId) {
    Swal.fire({
      icon: 'warning',
      title: 'Erreur',
      text: 'Magasinier non identifié.',
    });
    return;
  }

  const getEntrepotsDuMagasinier = async (magasinierId) => {
    try {
      const response = await axios.get(`/api/entrepot/recuperer/${magasinierId}`);
      setEntrepots(response.data); // Stocker la liste des entrepôts
    } catch (error) {
      console.error("Erreur lors de la récupération des entrepôts:", error);
    }
  };

  // Charger les entrepôts au montage du composant
  useEffect(() => {
    if (magasinierId) {
      getEntrepotsDuMagasinier(magasinierId);
    }
  }, [magasinierId]);


  useEffect(() => {
    const fetchCommandes = async () => {
      setLoadingEntrepots(true);
      try {
        const response = await axios.get("/api/commandes/TermineeLivree");
        setLoadingEntrepots(false);
        const sortedCommandes = response.data.sort((a, b) => {
          // Assurez-vous que la date est dans le bon format et qu'elle est valide
          const dateA = new Date(a.dateCommande);
          const dateB = new Date(b.dateCommande);
          return dateB - dateA;  // Trier du plus récent au plus ancien
        });
        setCommandes(sortedCommandes);
      } catch (error) {
        setLoadingEntrepots(true);
        console.error("Erreur lors de la récupération des commandes", error);
      }
    };
    fetchCommandes();
  }, []);


  const getDetailsCommande = (commandeId) => {
    const commande = commandes.find((c) => c._id === commandeId);
    setCommandeSelectionnee(commande);
  };
  const validerVente = async () => {
    if (!entrepotSelectionne) {
      Swal.fire({
        icon: 'warning',
        title: 'Erreur',
        text: "Veuillez sélectionner un entrepôt avant de valider la vente.",
      });
      return;
    }
    setLoadingAction(true);
    try {
      const response = await axios.post("/api/ventes/valider", {
        commandeId: commandeSelectionnee._id,
        magasinierId,
        entrepotId: entrepotSelectionne,
      });

      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: response.data.message,
      }).then(() => {
        window.location.reload();
      });

      playSound();
      setCommandes(commandes.filter(cmd => cmd._id !== commandeSelectionnee._id));
      setCommandeSelectionnee(null);
    } catch (error) {
      console.error("Erreur lors de la validation de la vente:", error);
      let errorMessage = error.response?.data.message || 'Échec de la validation de la vente.';

      // Vérifier si l'erreur concerne une rupture de stock
      if (errorMessage.includes("🚨")) {
        Swal.fire({
          icon: 'warning',
          title: 'Stock insuffisant',
          html: `<b>${errorMessage}</b>`,
        });

        // Extraire le nom du produit en rupture de stock
        const match = errorMessage.match(/"([^"]+)"/); // Récupère le nom du produit entre guillemets
        const produitNom = match ? match[1] : "Produit inconnu";

        // Envoyer la notification à l'admin
        const data = {
          "produit": produitNom,
          "quantiteRestante": "0"
        };

        console.log("Envoi de la notification:", data);

        axios.post('/api/notif/rupture-stock', data)
          .then(response => {
            toast.warn(`Attention : Rupture de stock sur ${produitNom}!`);
          })
          .catch(error => {
            console.error('Erreur lors de l\'envoi de la notification :', error.response?.data || error);
            toast.error('Erreur lors de l\'envoi de la notification de rupture de stock.');
          });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMessage,
        });
      }
    }
  };





  // Effect pour suivre les changements de taille de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // Filtrage des commandes
  const filteredCommandes = commandes.filter((commande) => {
    const dateCommande = commande.updatedAt ? new Date(commande.updatedAt).toISOString().split("T")[0] : "";
    const clientNom = commande.clientId ? commande.clientId.nom : commande.commercialId ? commande.commercialId.nom : "N/A";

    const matchesSearchTerm = searchTerm === "" || (commande.referenceFacture && commande.referenceFacture.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesClientType = clientType === "" || (clientType === "client" && commande.clientId) || (clientType === "commercial" && commande.commercialId);
    const matchesStatutCommande = statutCommande === "" || commande.statut.toLowerCase() === statutCommande.toLowerCase();
    const matchesSearchDate = searchDate === "" || dateCommande === searchDate;

    return matchesSearchTerm && matchesClientType && matchesStatutCommande && matchesSearchDate;
  });

  // Tri des commandes par date
  const sortedCommandes = filteredCommandes.sort((a, b) => {
    const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0); // Date par défaut au cas où
    const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0); // Date par défaut au cas où

    if (sortOrder === "asc") {
      return dateA - dateB; // Tri croissant
    } else {
      return dateB - dateA; // Tri décroissant
    }
  });

  const handleSortieFournisseur = async (commande) => {
    if (!commande) {
      Swal.fire({
        icon: 'warning',
        title: 'Erreur',
        text: 'Aucune commande sélectionnée.',
      });
      return;
    }
  
    setLoadingAction(true);
    try {
      const response = await axios.put(`/api/commandes/sortieFournisseur/${commande._id}`, {
        modeLivraison: 'fournisseur',
        statut: 'payé et livré',
      });
  
      // Vérifiez la réponse du backend
      console.log("Réponse backend:", response.data);
  
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: response.data.message,
      });
  
      // Rafraîchir les données ou mettre à jour l'état local
      // Par exemple, vous pouvez appeler une fonction pour récupérer de nouveau la commande mise à jour :
      setCommandes(prevCommandes => {
        return prevCommandes.map(c => 
          c._id === commande._id ? { ...c, statut: 'payé et livré', modeLivraison: 'fournisseur' } : c
        );
      });
  
    } catch (error) {
      console.error("Erreur:", error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || 'Échec de la sortie fournisseur.',
      });
    } finally {
      setLoadingAction(false);
    }
  };
    



  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="sortie-stock-section mt-3">
          <h6>Historique des Sorties de stock</h6>
          <div className="filtrage bg-light p-2 mt-2">
            <h6 className="fw-bold">
              <i className="fa fa-search"></i> Filtrage
            </h6>
            <form className="center">
              <input
                type="text"
                className="form-control p-1 mt-2 m-1"  // Réduire le padding et la marge
                placeholder="Recherche de commande"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="form-control mt-2 m-1 p-1"  // Réduire le padding et la marge
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
              >
                <option value="">Type de client</option>
                <option value="client">Client</option>
                <option value="commercial">Commercial</option>
              </select>
              <select
                className="form-control mt-2 m-1 p-1" // Réduire le padding et la marge
                value={statutCommande}
                onChange={(e) => setStatutCommande(e.target.value)}
              >
                <option value="">Statut du commande</option>
                <option value="terminée">Terminée</option>
                <option value="livrée">Livrée</option>
              </select>
              <input
                type="date"
                className="form-control mt-2 m-1 p-1" // Réduire le padding et la marge
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </form>
          </div>

          {loadingEntrepots ? (
            <div className="loading-container" style={{ position: 'relative', top: '-250px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : (


            <div className="table-container" style={{ overflowX: 'hidden', overflowY: 'auto' }}>
              <table className="tableMa table-striped mt-3">
                <thead>
                  <tr>
                    <th>{isMobile ? "Réf Fact" : "Référence facture"}</th>
                    <th>Vendeur</th>
                    <th>Client</th>
                    <th>Mode de paiement</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th>Mode de livraison</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommandes.map((commande) => (
                    <tr key={commande._id}>
                      <td>{commande.referenceFacture}</td>
                      <td>{commande.vendeurId ? commande.vendeurId.nom : "N/A"}</td>
                      <td>{commande.clientId ? commande.clientId.nom : commande.commercialId ? commande.commercialId.nom : "N/A"}</td>
                      <td>{commande.paiement ? commande.paiement.modePaiement : "à crédit"}</td>
                      <td>{commande.statut}</td>
                      <td>{commande.updatedAt ? new Date(commande.updatedAt).toLocaleDateString() : "N/A"}</td>
                      <td>{commande.modeLivraison ? (commande.modeLivraison) : "Inconnu"}</td>
                      <td>
                        {isMobile ? (
                          <button
                            className="btn btn-info"
                            type="button"
                            data-bs-toggle="modal"
                            data-bs-target="#DétailsCommande"
                            onClick={() => getDetailsCommande(commande._id)}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        ) : (
                          <button
                            className="btn btn-info"
                            type="button"
                            data-bs-toggle="modal"
                            data-bs-target="#DétailsCommande"
                            onClick={() => getDetailsCommande(commande._id)}
                          >
                            Voir Détails
                          </button>
                        )}
                        {/* Bouton pour sortie fournisseur */}
                        {commande.statut === 'payé' && (
  <button
    className="btn btn-danger ms-2"
    onClick={() => handleSortieFournisseur(commande)}
    disabled={commande.statut !== 'payé'} // Désactive le bouton si la commande n'est pas livrée
  >
    Sortie Fournisseur
  </button>
)}

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>)}
          <div className="modal fade" id="DétailsCommande" tabIndex="-1" aria-labelledby="DétailsCommandeLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-md">

              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-info" id="DétailsCommandeLabel">Détails de la commande</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {commandeSelectionnee ? (
                    <>
                      <p>
                        <strong>{commandeSelectionnee.clientId ? "Client" : "Commercial"}:</strong>
                        {commandeSelectionnee.clientId ? commandeSelectionnee.clientId.nom : commandeSelectionnee.commercialId ? commandeSelectionnee.commercialId.nom : "N/A"}
                      </p>
                      <p><strong>Date:</strong> {commandeSelectionnee.updatedAt ? new Date(commandeSelectionnee.updatedAt).toLocaleDateString() : "N/A"}</p>
                      <p><strong>Type de Client:</strong> {commandeSelectionnee.clientId ? "Client" : commandeSelectionnee.commercialId ? "Commercial" : "N/A"}</p>
                      <table className="modaltable ">
                        <thead>
                          <tr>
                            <th className="w-20">Produit</th>
                            <th className="w-25">Quantité</th>
                            <th className="w-25">Unité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {commandeSelectionnee.produits.map((produit, index) => (
                            <tr key={index}>
                              <td className="w-50">{produit.produit ? produit.produit.nom : "N/A"}</td>
                              <td className="w-25">{produit.quantite}</td>
                              <td className="w-25">{produit.uniteChoisie ? produit.uniteChoisie : "N/A"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <p>Aucune commande sélectionnée</p>
                  )}
                </div>

                <div className="modal-footer center">
                  {commandeSelectionnee && commandeSelectionnee.statut.toLowerCase() === "payé" && (
                    <div className="mb-3">
                      <label htmlFor="entrepotSelectionne" className="form-label">Choisissez l'entrepôt :</label>
                      <select
                        id="entrepotSelectionne"
                        value={entrepotSelectionne}
                        onChange={(e) => setEntrepotSelectionne(e.target.value)}
                        className="form-control" // Classe Bootstrap pour les menus déroulants
                      >
                        <option value="">Sélectionnez un entrepôt</option>
                        {entrepots.map((entrepot) => (
                          <option key={entrepot._id} value={entrepot._id}>
                            {entrepot.nom} - {entrepot.localisation}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {commandeSelectionnee && commandeSelectionnee.statut.toLowerCase() === "payé" && (
                    <button className="btn btn-info" disabled={loadingAction} onClick={validerVente}>
                      {loadingAction ? (
                        <>
                          <span className="spinner-border " style={{ width: '4rem', height: '4rem' }}></span> Chargement...
                        </>
                      ) : (
                        "Valider la sortie"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

export default SortieStock;
