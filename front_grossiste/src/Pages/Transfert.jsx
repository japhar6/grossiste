import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { toast } from "react-toastify";
import Sidebar from "../Components/SidebarMagasinier";
import Header from "../Components/NavbarM";
import "../Styles/Transfert.css";
import TransfertModal from "../Components/TransfertModal";
import ReceptionModal from "../Components/ReceptionModal";

const Transfert = () => {
  const [entrepots, setEntrepots] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [entrepot, setEntrepot] = useState(null);
  const [historiqueTransferts, setHistoriqueTransferts] = useState([]);
  const [statutFiltre, setStatutFiltre] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showModalReception, setShowModalReception] = useState(false);
  const [transfertId, setTransfertId] = useState(null);
  const [quantiteEnvoyee, setQuantiteEnvoyee] = useState(0); // État pour la quantité envoyée
  const [entrepotSource, setEntrepotSource] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userid");
  const [loading, setLoading] = useState(false);
  const [selectedEntrepot, setSelectedEntrepot] = useState(null);
  const [error, setError] = useState(null);
  const [produit, setProduit] = useState(null);
  useEffect(() => {
    const fetchEntrepots = async () => {
      try {
        const response = await axios.get(`/api/entrepot/recuperer/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntrepots(response.data); // Stocke la liste d'entrepôts
      } catch (error) {
        toast.error("Erreur lors du chargement des entrepôts.");
        console.error(error);
      }
    };
    fetchEntrepots();
  }, [token, userId]);

  // Mise à jour de l'entrepôt source lorsque l'entrepôt sélectionné change
  const handleEntrpotChange = (e) => {
    const selectedEntrepot = entrepots.find(
      (entrepot) => entrepot._id === e.target.value
    );
    setEntrepotSource(selectedEntrepot);
  };

  // Récupère les stocks de l'entrepôt sélectionné
  useEffect(() => {
    if (!entrepot) return;

    const fetchStocks = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/stocks/stocks/${entrepot._id}`);
        setStocks(response.data);
      } catch (err) {
        toast.error("Erreur lors du chargement des stocks.");
        setError("Erreur lors du chargement des stocks.");
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [entrepot]);

  // Récupère l'historique des transferts de l'entrepôt source
  useEffect(() => {
    if (!entrepotSource) return; // Vérifie que l'entrepôt source est défini

    axios
      .get("/api/transfert/recup")
      .then((response) => {
        const filteredTransfers = response.data.filter(
          (transfert) =>
            transfert.entrepotSource?._id === entrepotSource._id ||
            transfert.entrepotDestination?._id === entrepotSource._id
        );
        setHistoriqueTransferts(filteredTransfers);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des transferts :", error);
        toast.error("Erreur lors de la récupération des transferts.");
      });
  }, [entrepotSource]);

  const fetchHistoriqueTransferts = () => {
    axios
      .get("/api/transfert/recup")
      .then((response) => {
        const filteredTransfers = response.data.filter(
          (transfert) =>
            transfert.entrepotSource._id === entrepotSource._id ||
            transfert.entrepotDestination._id === entrepotSource._id
        );
        setHistoriqueTransferts(filteredTransfers);
      })
      .catch((error) => {
        toast.error("Erreur lors de la récupération des transferts.");
      });
  };

  const handleValidation = (id, statut) => {
    axios
      .put(`/api/transfert/valider/${id}`, { statut })
      .then(() => {
        toast.success(`Transfert ${statut.toLowerCase()} avec succès.`);
      })
      .catch(() => toast.error("Erreur de validation."));
  };

  // Ouverture du modal de réception
  const openReceptionModal = (id, quantiteEnvoyee, entrepotSource, produit) => {
    setTransfertId(id);
    setQuantiteEnvoyee(quantiteEnvoyee); // Sauvegarder la quantité envoyée
    setShowModalReception(true);
    setEntrepotSource(entrepotSource);  // Sauvegarder l'entrepôt source
    setProduit(produit);                // Sauvegarder l'objet produit
  };


  const filteredTransferts = historiqueTransferts.filter((transfert) =>
    statutFiltre ? transfert.statutAdmin === statutFiltre : true
  );

  const handleRecevoirButtonVisibility = (transfert) => {
    return (
      transfert.entrepotDestination?._id === entrepotSource?._id &&
      transfert.statutAdmin === "approuvé" &&
      transfert.statutEntrepotDestination !== "reçu"
    );
  };

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue p-3">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3 bg-light shadow rounded">
            <h6 className="alert alert-info">Transfert Inter-Entrepôts</h6>


            <button
              className="btn btn-success mb-3 new"
              onClick={() => setShowModal(true)}
              style={{ width: 'auto' }}
              disabled={!entrepotSource}
            >
              Nouveau Transfert
            </button>

            <h3 className="alert alert-success">Historique des Transferts</h3>
            <div className="mt-3">
              <select
                className="form-control"
                onChange={(e) =>
                  setEntrepot(
                    entrepots.find((ent) => ent._id === e.target.value)
                  )
                }
                defaultValue=""
                onClick={handleEntrpotChange}
              >
                <option value="">-- Sélectionner un entrepôt source --</option>
                {entrepots.map((ent) => (
                  <option key={ent._id} value={ent._id}>
                    {ent.nom}
                  </option>
                ))}
              </select>
            </div>
            <label className="mt-5 fw-bold">Filtrer par Statut:</label>
            <select
              className="form-control"
              value={statutFiltre}
              onChange={(e) => setStatutFiltre(e.target.value)}
            >
              <option value="">Tous</option>
              <option value="en attente">En attente</option>
              <option value="approuvé">Validé</option>
              <option value="rejeté">Rejeté</option>
            </select>
            <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
              <table className="table table-bordered table-striped">
                <thead className="thead-dark">
                  <tr>
                    <th className="bg-success">Source</th>
                    <th>Destination</th>
                    <th className="bg-success">Produit</th>
                    <th>Quantité</th>
                    <th className="bg-success">Unité</th>
                    <th >Date</th>
                    <th className="bg-success"> Statut</th>
                    <th >Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransferts.map((transfert) => (
                    <tr key={transfert._id}>
                      <td>{transfert.entrepotSource?.nom || "N/A"}</td>
                      <td>{transfert.entrepotDestination?.nom || "N/A"}</td>
                      <td>{transfert.produit?.nom || "N/A"}</td>
                      <td>{transfert.quantitéEnvoyée}</td>
                      <td>
                        {
                          transfert.produit?.unites?.length
                            ? transfert.produit.unites.reduce((max, unite) => unite.conversion > max.conversion ? unite : max, transfert.produit.unites[0]).nom
                            : 'N/A'
                        }
                      </td>
                      <td>
                        {new Date(transfert.dateTransfert).toLocaleDateString()}
                      </td>
                      <td>{transfert.statutAdmin}</td>
                      <td>
                        {/* Affiche "Recevoir" uniquement si c'est l'entrepôt destinataire et les conditions sont remplies */}
                        {handleRecevoirButtonVisibility(transfert) && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              openReceptionModal(
                                transfert._id,
                                transfert.quantitéEnvoyée,
                                transfert.entrepotSource,
                                transfert.produit // Passe ici l'objet produit
                              )
                            }
                          >
                            Recevoir
                          </button>

                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div> </div>
        </div>
      </section>

      {showModal && (
        <TransfertModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          refreshHistorique={fetchHistoriqueTransferts}
          entrepotSource={entrepot}
        />
      )}
      {showModalReception && (
        <ReceptionModal
          show={showModalReception}
          handleClose={() => setShowModalReception(false)}
          transfertId={transfertId}
          quantiteEnvoyee={quantiteEnvoyee} // Passer la quantité envoyée au modal
          produit={produit} // Passer l'objet produit à la modal
          refreshHistorique={fetchHistoriqueTransferts}
          entrepotSource={entrepotSource}
        />
      )}

    </main>
  );
};

export default Transfert;
