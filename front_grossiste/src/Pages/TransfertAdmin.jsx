import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Navbar";
import '../Styles/Transfert.css';

const TransfertAdmin = () => {
  const [entrepots, setEntrepots] = useState([]);
  const [historiqueTransferts, setHistoriqueTransferts] = useState([]);
  const [statutFiltre, setStatutFiltre] = useState('');
  const [entrepotSourceFiltre, setEntrepotSourceFiltre] = useState('');
  const [entrepotDestinationFiltre, setEntrepotDestinationFiltre] = useState('');
  const [dateFiltre, setDateFiltre] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingActionS, setLoadingActionS] = useState(false);
  const [loadingEntrepots, setLoadingEntrepots] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoadingEntrepots(true);
    axios.get(`/api/entrepot/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => setEntrepots(response.data))
      .catch(() => toast.error("Erreur lors du chargement de l'entrepôt."));
    setLoadingEntrepots(false);
  }, []);

  useEffect(() => {
    fetchHistoriqueTransferts();
  }, []);

  const fetchHistoriqueTransferts = () => {
    axios.get('/api/transfert/recup')
      .then(response => setHistoriqueTransferts(response.data))
      .catch(() => toast.error("Erreur lors du chargement de l'historique des transferts."));
  };

  const handleValidation = (transfert, statut) => {
    if (!transfert || !transfert.statutAdmin) {
      console.error("L'objet transfert ou la propriété statutAdmin est manquant");
      return;
    }
    setLoadingAction(true);

    Swal.fire({
      title: 'Confirmer',
      text: `Êtes-vous sûr de vouloir ${statut.toLowerCase()} ce transfert ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        const dataToSend = { statut: statut };

        axios.put(`/api/transfert/valider-admin/${transfert._id}`, dataToSend)
          .then(() => {
            toast.success(`Transfert ${statut.toLowerCase()} avec succès.`);
            fetchHistoriqueTransferts();
            setLoadingAction(false);
          })
          .catch(() => toast.error('Erreur de validation.'));
        setLoadingAction(false);
      }
    });
  };

  const filteredTransferts = historiqueTransferts.filter(transfert => {
    const matchesStatut = statutFiltre ? transfert.statutAdmin === statutFiltre : true;
    const matchesSourceEntrepot = entrepotSourceFiltre ?
      transfert.entrepotSource?._id === entrepotSourceFiltre : true;
    const matchesDestinationEntrepot = entrepotDestinationFiltre ?
      transfert.entrepotDestination?._id === entrepotDestinationFiltre : true;
    const matchesDate = dateFiltre ?
      new Date(transfert.dateTransfert).toLocaleDateString() === new Date(dateFiltre).toLocaleDateString() : true;

    return matchesStatut && matchesSourceEntrepot && matchesDestinationEntrepot && matchesDate;
  });

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue p-3">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3 bg-light shadow rounded">
            <h2 className='alert alert-success text-center'>Transfert Inter-Entrepôts</h2>
            <h3>Historique des Transferts</h3>
            <div className="container-fluid">
              <div className="row">
                {/* Filtrer par Statut */}
                <div className="col-md-3 col-sm-6 mb-3">
                  <label>Filtrer par Statut:</label>
                  <select className="form-control" value={statutFiltre} onChange={(e) => setStatutFiltre(e.target.value)}>
                    <option value="">Tous</option>
                    <option value="en attente">En attente</option>
                    <option value="approuvé">Validé</option>
                    <option value="rejeté">Rejeté</option>
                  </select>
                </div>

                {/* Filtrer par Entrepôt Source */}
                <div className="col-md-3 col-sm-6 mb-3">
                  <label>Filtrer par Entrepôt Source:</label>
                  <select className="form-control" value={entrepotSourceFiltre} onChange={(e) => setEntrepotSourceFiltre(e.target.value)}>
                    <option value="">Tous</option>
                    {entrepots.map(entrepot => (
                      <option key={entrepot._id} value={entrepot._id}>{entrepot.nom}</option>
                    ))}
                  </select>
                </div>

                {/* Filtrer par Entrepôt Destination */}
                <div className="col-md-3 col-sm-6 mb-3">
                  <label>Filtrer par Entrepôt Destination:</label>
                  <select className="form-control" value={entrepotDestinationFiltre} onChange={(e) => setEntrepotDestinationFiltre(e.target.value)}>
                    <option value="">Tous</option>
                    {entrepots.map(entrepot => (
                      <option key={entrepot._id} value={entrepot._id}>{entrepot.nom}</option>
                    ))}
                  </select>
                </div>

                {/* Filtrer par Date */}
                <div className="col-md-3 col-sm-6 mb-3">
                  <label>Filtrer par Date:</label>
                  <input type="date" className="form-control" value={dateFiltre} onChange={(e) => setDateFiltre(e.target.value)} />
                </div>
              </div>
            </div>


            <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
              {loadingEntrepots ? (
                <div className="loading-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                <table className="table table-bordered table-striped">
                  <thead className="thead-dark">
                    <tr>
                      <th>Source</th>
                      <th>Destination</th>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Date</th>
                      <th>Statut Admin</th>
                      <th>Statut Magasinier Destination</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransferts.map((transfert) => (
                      <tr key={transfert._id}>
                        <td>{transfert.entrepotSource?.nom || 'N/A'}</td>
                        <td>{transfert.entrepotDestination?.nom || 'N/A'}</td>
                        <td>{transfert.produit?.nom || 'N/A'}</td>
                        <td>{transfert.quantitéEnvoyée}</td>
                        <td>{new Date(transfert.dateTransfert).toLocaleDateString()}</td>
                        <td>{transfert.statutAdmin}</td>
                        <td>{transfert.statutEntrepotDestination}</td>
                        <td>
                          {transfert.statutAdmin === 'en attente' && (
                            <div className="d-flex justify-content-around">
                              <button className="btn btn-success custom-button" disabled={loadingAction} style={{ marginRight: '10px' }} onClick={() => handleValidation(transfert, 'Validé')}>
                                {loadingAction ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm"></span> Chargement...
                                  </>
                                ) : (
                                  "Valider"
                                )}
                              </button>
                              <button className="btn btn-danger custom-button" disabled={loadingAction} onClick={() => handleValidation(transfert, 'Rejeté')}>
                                {loadingAction ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm"></span> Chargement...
                                  </>
                                ) : (
                                  "Refuser"
                                )}
                              </button>
                            </div>
                          )}
                        </td>


                      </tr>
                    ))}
                  </tbody>

                </table>

              )}
            </div> </div>
        </div>
      </section>
    </main>
  );
};

export default TransfertAdmin;
