import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Styles/SortieStock.css";
import Sidebar from "../Components/SidebarMagasinier";
import Header from "../Components/NavbarM";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

function RetourStockCom() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [paiements, setPaiements] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // État pour la recherche
  const [status, setStatus] = useState(""); // État pour le statut
  const [date, setDate] = useState(""); // État pour la date

  // Resize handler pour gérer la responsivité
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Récupération des paiements commerciaux depuis l'API
  useEffect(() => {
    axios.get("http://localhost:5000/api/paiementCom/info")
      .then(response => {
        setPaiements(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des paiements :", error);
        setError("Erreur lors de la récupération des paiements.");
      });
  }, []);

  // Fonction pour récupérer les ventes d'un commercial
  // Fonction pour récupérer les ventes à partir de commercialId et commandeId
const fetchVentesByInfo = (commercialId, commandeId) => {
  if (!commercialId || !commandeId) {
    console.error("Le commercialId ou commandeId est undefined ou invalide.");
    return Promise.reject("Le commercialId ou commandeId est undefined ou invalide.");
  }

  return axios.get(`http://localhost:5000/api/paiementCom/performance/commercial/${commercialId}/commande/${commandeId}`)
    .then(response => {
      console.log("Ventes récupérées pour le commercial et la commande:", response.data);
      setVentes(response.data);
      setError(""); // Réinitialiser l'erreur en cas de succès
      return response.data;
    })
    .catch(error => {
      console.error("Erreur lors de la récupération des ventes :", error);
      setError("Erreur lors de la récupération des ventes.");
      return Promise.reject(error);
    });
};

// Ouverture du modal et récupération des ventes
const openModal = (paiement) => {
  if (paiement.commercial && paiement.commande) {
    console.log("Paiement trouvé:", paiement);

    // Récupérer les ventes avec commercialId et commandeId
    fetchVentesByInfo(paiement.commercial, paiement.commande)
      .then(ventes => {
        // Une fois les ventes récupérées, on met à jour modalData
        setModalData({
          paiement: paiement,  // Données du paiement
          ventes: ventes       // Données des ventes récupérées
        });
        console.log("Ventes récupérées:", ventes); // Vérifier que les ventes sont bien récupérées
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des ventes:", error);
        setError("Impossible de récupérer les ventes.");
      });
  } else {
    console.error("Commercial ID ou Commande ID est indéfini pour paiement:", paiement);
    setError("ID du commercial ou de la commande non trouvé.");
  }
};


  const handleReturnValidation = () => {
    const magasinierId = localStorage.getItem("userid"); // Récupérer magasinierId
    console.log("Magasinier ID:", magasinierId); // Vérification

    const venteComId = modalData?.ventes?.[0]?._id || null;

    console.log("Vente Com ID trouvé:", venteComId); // Vérification

    if (!magasinierId || !venteComId) {
      setError("Informations manquantes pour la validation du retour.");
      return;
    }

    const returnData = {
      magasinierId: magasinierId,
      venteComId: venteComId,
    };

    axios.post("http://localhost:5000/api/ventes/retour", returnData)
      .then(response => {
        console.log("Retour validé avec succès", response.data);
        // Mettre à jour l'UI ou notifier l'utilisateur si nécessaire
        setError(""); // Réinitialiser l'erreur
      })
      .catch(error => {
        console.error("Erreur lors de la validation du retour:", error);
        setError("Erreur lors de la validation du retour.");
      });
  };

  // Fonction pour filtrer les paiements
  const filteredPaiements = paiements.filter(paiement => {
    const matchesSearch = paiement.referenceFacture.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = status ? paiement.statut === status : true;
    const matchesDate = date ? new Date(paiement.date).toISOString().split('T')[0] === date : true;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="sortie-stock-section mt-3">
          <h6>Historique des retours de stock</h6>

          {error && <div className="alert alert-danger">{error}</div>} {/* Affichage des erreurs */}

          <div className="filtrage bg-light p-2 mt-2">
            <h6 className="fw-bold">
              <i className="fa fa-search"></i> Filtrage
            </h6>
            <form className="center">
              <input 
                type="text" 
                className="form-control p-1 mt-2 m-1" 
                placeholder="Recherche de commande" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} // Mise à jour de la recherche
              />
              <select 
                className="form-control mt-2 m-1 p-1" 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} // Mise à jour du statut
              >
                <option value="">Statut de la commande</option>
                <option value="partiel">Partiel</option>
                <option value="complet">Complet</option>
              </select>
              <input 
                type="date" 
                className="form-control mt-2 m-1 p-1" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} // Mise à jour de la date
              />
            </form>
          </div>

          <table className="tableMa table-striped mt-3">
            <thead>
              <tr>
                <th>{isMobile ? "Réf Fact" : "Référence facture"}</th>
                <th>Caissier</th>
                <th>Commercial</th>
                <th>Mode de paiement</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {filteredPaiements.length > 0 ? (
                filteredPaiements.map((paiement, index) => (
                  <tr key={index}>
                    <td>{paiement.referenceFacture}</td>
                    <td>{paiement.caissier}</td>
                    <td>{paiement.commercial}</td> 
                    <td>{paiement.modePaiement}</td>
                    <td>{paiement.statut}</td>
                    <td>{paiement.date}</td>
                    <td>
                      {isMobile ? (
                        <button className="btn btn-info" type="button" data-bs-toggle="modal" data-bs-target="#ProduitRetour" onClick={() => openModal(paiement)}>
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      ) : (
                        <button className="btn btn-info" type="button" data-bs-toggle="modal" data-bs-target="#ProduitRetour" onClick={() => openModal(paiement)}>
                          Voir Détails
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">Aucune donnée disponible</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Modal pour afficher les détails */}
          <div className="modal fade" id="ProduitRetour" tabIndex="-1" aria-labelledby="ProduitRetourLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-info" id="ProduitRetourLabel">Détails des produit à retourner</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                  {modalData ? (
                    <div>
                      <table className="modaltable">
                        <thead>
                          <tr>
                            <th className="w-20">Produit</th>
                            <th className="w-25">Quantité</th>
                            <th className="w-25">Unité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ventes.length > 0 ? (
                            ventes[0].produitsRestants.map((produit, index) => (
                              <tr key={index}>
                                <td>{produit.produitId.nom}</td>
                                <td>{produit.quantiteRestante}</td>
                                <td>{produit.unite}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="text-center">Aucun produit trouvé</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>Aucune commande sélectionnée</p>
                  )}
                </div>

                <div className="modal-footer center">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                  <button className="btn btn-info" onClick={handleReturnValidation}>Valider le retour</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

export default RetourStockCom;
