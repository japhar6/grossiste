import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../api/axios';
import Swal from "sweetalert2";
import "../Styles/Histov.css";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import EditCommandeModal from '../Components/EditCommande';

function HistoV() {
  const [commandes, setCommandes] = useState([]); const [dateStart, setDateStart] = useState("");  // Date de début
  const [dateEnd, setDateEnd] = useState("");      // Date de fin
  const [dateFilter, setDateFilter] = useState("");  // Date spécifique
  const [isDateRange, setIsDateRange] = useState(false);
  const [modePaiementFilter, setModePaiementFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [filtreNomCaissier, setFiltreNomCaissier] = useState("");
  const vendeurId = localStorage.getItem('userid');
  const [triMontant, setTriMontant] = useState("desc"); // État pour trier par montant
  const [filtreNomClientCommercial, setFiltreNomClientCommercial] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filtreTypeClient, setfiltreTypeClient] = useState("");
  const [filtreNomProduit, setFiltreNomProduit] = useState(""); // État pour le nom du produit

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [orderBy, setOrderBy] = useState("nom");
  const [order, setOrder] = useState("asc");













  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const response = await axios.get(`/api/commandes/`);
        console.log("Commandes récupérées :", response.data);

        const sortedCommandes = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCommandes(sortedCommandes);
      } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
        Swal.fire({
          title: 'Erreur',
          text: "Impossible de récupérer les commandes.",
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    };

    fetchCommandes();
  }, [vendeurId]);

  // Filtrage des commandes
  const filteredCommandes = commandes.filter(commande => {
    const createdDate = new Date(commande.createdAt).toISOString().slice(0, 10);
    // Filtrage par une seule date (dateFilter) ou un intervalle de dates (dateStart et dateEnd)
    const dateMatch = (dateStart && dateEnd) ?
      (createdDate >= dateStart && createdDate <= dateEnd) :
      (dateFilter ? createdDate === dateFilter : true); // Si une seule date est donnée, on filtre par celle-ci

    const modePaiementMatch = modePaiementFilter ? commande.modePaiement === modePaiementFilter : true;
    const statutMatch = statutFilter ? commande.statut === statutFilter : true;
    const matchesNomCaissier = !filtreNomCaissier ||
      (commande.vendeurId && commande.vendeurId.nom && commande.vendeurId.nom.toLowerCase().includes(filtreNomCaissier.toLowerCase()));
    const matchesClientOrCommercial = !filtreNomClientCommercial ||
      (commande.clientId?.nom && commande.clientId.nom.toLowerCase().includes(filtreNomClientCommercial.toLowerCase())) ||
      (commande.commercialId?.nom && commande.commercialId.nom.toLowerCase().includes(filtreNomClientCommercial.toLowerCase()));
    const matchesTypeClient = !filtreTypeClient ||
      (commande.typeClient && commande.typeClient === filtreTypeClient);
    const matchesNomProduit = !filtreNomProduit || commande.produits.some(produit =>
      produit.produit.nom.toLowerCase().includes(filtreNomProduit.toLowerCase())
    );
    return dateMatch && modePaiementMatch && statutMatch && matchesNomCaissier && matchesClientOrCommercial && matchesNomProduit && matchesTypeClient;
  })
    .sort((a, b) => {
      if (!orderBy) return 0; // Pas de tri si aucune colonne sélectionnée

      let valueA, valueB;

      switch (orderBy) {
        case "reference":
          valueA = a.reference;
          valueB = b.reference;
          break;

        case "montant":
          valueA = a.totalGeneral; // Remplace "montant" par "totalGeneral" si nécessaire
          valueB = b.totalGeneral;
          break;

        case "createdAt":
          valueA = new Date(a.createdAt).getTime(); // Convertir en timestamp
          valueB = new Date(b.createdAt).getTime();
          break;

        case "nom":
          valueA = a.clientId?.nom || a.commercialId?.nom || ""; // Prend le nom du client ou du commercial
          valueB = b.clientId?.nom || b.commercialId?.nom || "";
          break;

        default:
          valueA = a[orderBy];
          valueB = b[orderBy];
      }

      // Vérifier que les valeurs ne sont pas nulles ou undefined
      if (valueA === undefined || valueA === null) valueA = "";
      if (valueB === undefined || valueB === null) valueB = "";

      // Comparaison (tri numérique si possible, sinon texte)
      if (!isNaN(valueA) && !isNaN(valueB)) {
        return order === "asc" ? valueA - valueB : valueB - valueA;
      } else {
        return order === "asc"
          ? valueA.toString().localeCompare(valueB.toString())
          : valueB.toString().localeCompare(valueA.toString());
      }
    });


  return (
    <>
      <main className="center">
        <Sidebar />
        <section className="contenue">
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3">
              <h6 className='alert alert-success'>Historique des Commandes</h6>

              {/* Filtres */}
              <div className="filters mb-4">
                <div className="row">
                  {/* Filtre intervalle de dates */}
                  <div className="d-flex align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input me-2 custom-checkbox"
                      id="dateRangeFilter"
                      checked={isDateRange}
                      onChange={(e) => setIsDateRange(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="dateRangeFilter">
                      Filtrer par intervalle de dates
                    </label>
                  </div>


                  {/* Champ de date spécifique */}
                  <div className="col-md-4 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Date du commande"
                      value={dateFilter}
                      onFocus={(e) => (e.target.type = "date")} // Transforme en date lors du focus
                      onBlur={(e) => (e.target.type = "text")}  // Reprend le placeholder après sélection
                      onChange={(e) => setDateFilter(e.target.value)}
                      style={{ display: isDateRange ? "none" : "block" }}
                    />
                  </div>


                  {/* Date de début pour l'intervalle */}
                  {isDateRange && (
                    <div className="col-md-4 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        onFocus={(e) => (e.target.type = "date")} // Transforme en date lors du focus
                        onBlur={(e) => (e.target.type = "text")}
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)} // Date de début pour l'intervalle
                        placeholder="Date de début"
                      />
                    </div>
                  )}

                  {/* Date de fin pour l'intervalle */}
                  {isDateRange && (
                    <div className="col-md-4 mb-3">
                      <input
                        type="text"
                        className="form-control"
                        onFocus={(e) => (e.target.type = "date")} // Transforme en date lors du focus
                        onBlur={(e) => (e.target.type = "text")}
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)} // Date de fin pour l'intervalle
                        placeholder="Date de fin"
                      />
                    </div>
                  )}

                  {/* Filtre par statut */}
                  <div className="col-md-4 mb-3">
                    <select
                      className="form-control"
                      onChange={(e) => setStatutFilter(e.target.value)}
                      value={statutFilter}
                    >
                      <option value="">Tous les statuts</option>
                      <option value="en cours">En Cours</option>
                      <option value="payé">Les commande Payé</option>
                      <option value="payé et livrée">Livrée</option>
                      <option value="annulée">Annulée</option>
                    </select>
                  </div>



                  {/* Filtrer par nom de produit */}
                  <div className="col-md-4 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Filtrer par produit"
                      value={filtreNomProduit}
                      onChange={e => setFiltreNomProduit(e.target.value)}
                    />
                  </div>

                  {/* Filtrer par type de client */}
                  <div className="col-md-4 mb-3">

                    <select
                      className="form-control"
                      value={filtreTypeClient}
                      onChange={e => setfiltreTypeClient(e.target.value)}
                    >
                      <option value="">Tous les types</option>
                      <option value="Client">Client</option>
                      <option value="Commercial">Commerciale</option>
                    </select>
                  </div>

                  {/* Trier par montant */}


                  {/* Filtrer par nom de vendeur */}
                  <div className="col-md-4 mb-3">
                    <label className="form-label">
                      <input
                        placeholder="Filtrer par nom de vendeur:"
                        type="text"
                        className="form-control"
                        value={filtreNomCaissier}
                        onChange={e => setFiltreNomCaissier(e.target.value)}
                      />
                    </label>
                  </div>
                  {/* Filtrer par nom du client ou commercial */}
                  <div className="col-md-4 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Filtrer par nom du client"
                      value={filtreNomClientCommercial}
                      onChange={e => setFiltreNomClientCommercial(e.target.value)}
                    />
                  </div>
                </div>
              </div>


              {filteredCommandes.length === 0 ? (
                <table className="table-striped">
                  <thead>
                    <tr>
                      <th>Reference du Commande</th>
                      <th>Date de Commande</th>
                      <th>Produits</th>
                      <th>Nom du client/commerciale</th>


                      <th>Statut</th>
                      <th>Fait par le vendeur :</th>
                      <th>Montant Total</th>
                    </tr>
                  </thead>
                  <tbody>
                  </tbody>    <tr>
                    <td colSpan={8} style={{ textAlign: 'center' }}>Aucunne commande trouvé.</td>
                  </tr>
                </table>
              ) : (
                <div className="scrollable-container">
                  <table className="table-striped">
                    <thead>
                      <tr>
                        <th>

                          Référence de Commande

                        </th>
                        <th>
                          <span
                            style={{ cursor: "pointer", color: 'white' }}
                            onClick={() => {
                              setOrderBy("createdAt"); // "createdAt" pour la date de commande
                              setOrder(order === "asc" ? "desc" : "asc");
                            }}
                          >
                            Date de Commande{" "}
                            {orderBy === "createdAt" && (order === "asc" ? "↑" : "↓")}
                          </span>
                        </th>
                        <th>Produits</th>
                        <th>
                          <span
                            style={{ cursor: "pointer", color: 'white' }}
                            onClick={() => {
                              setOrderBy("nom");
                              setOrder(order === "asc" ? "desc" : "asc");
                            }}
                          >
                            Nom du Client/Commercial{" "}
                            {orderBy === "nom" && (order === "asc" ? "↑" : "↓")}
                          </span>
                        </th>
                        <th>Statut</th>
                        <th>Fait par le Vendeur</th>
                        <th>Mode de Livraison</th>
                        <th>
                          <span
                            style={{ cursor: "pointer", color: 'white' }}
                            onClick={() => {
                              setOrderBy("totalGeneral"); // "totalGeneral" pour le montant total
                              setOrder(order === "asc" ? "desc" : "asc");
                            }}
                          >
                            Montant Total{" "}
                            {orderBy === "totalGeneral" && (order === "asc" ? "↑" : "↓")}
                          </span>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCommandes.map((commande) => {
                        console.log("Commande analysée :", commande); // Debug

                        return (
                          <tr key={commande._id}>
                            <td>{commande.referenceFacture}</td>
                            <td>{new Date(commande.createdAt).toLocaleDateString()}</td>
                            <td className="text-noir" style={{ color: "black" }}>
                              <ul className="produit-list">
                                {commande.produits.map((produit) => (
                                  <li key={produit._id}>
                                    {produit.produit?.nom || "Inconnu"} - {produit.quantite} x {produit.prixdevente} ariary
                                  </li>
                                ))}

                              </ul>
                            </td>
                            <td>
                              {commande.clientId?.nom || commande.commercialId?.nom || "Inconnu"}
                            </td>



                            <td>{commande.statut}</td>
                            <td>{commande.vendeurId?.nom || "Inconnu"}</td>

                            <td>{commande.modeLivraison ? commande.modeLivraison : "Non Spécifié"} </td>
                            <td>{commande.totalGeneral} ariary</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <div>


          </div>
        </section>
      </main>
    </>
  );
}

export default HistoV;
