import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import Sidebar from "../Components/SidebarMagasinier";
import Header from "../Components/NavbarM";
import '../Styles/Transfert.css';
import TransfertModal from '../Components/TransfertModal';
import ReceptionModal from '../Components/ReceptionModal';

const Transfert = () => {
  const [entrepots, setEntrepots] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [entrepot, setEntrepot] = useState(null);
  const [historiqueTransferts, setHistoriqueTransferts] = useState([]);
  const [statutFiltre, setStatutFiltre] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showModalReception, setShowModalReception] = useState(false);
  const [transfertId, setTransfertId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userid");
    axios.get(`/api/entrepot/recuperer/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(response => setEntrepot(response.data))
      .catch(() => toast.error("Erreur lors du chargement de l'entrepôt."));
  }, []);

  useEffect(() => {
    if (!entrepot) return;
    axios.get(`/api/stocks/stocks/${entrepot._id}`)
      .then(response => setStocks(response.data))
      .catch(() => toast.error("Erreur lors du chargement des stocks."));
  }, [entrepot]);

  useEffect(() => {
    axios.get('/api/entrepot')
      .then(response => setEntrepots(response.data));
    fetchHistoriqueTransferts();
  }, []);

  const fetchHistoriqueTransferts = () => {
    axios.get('/api/transfert/recup')
      .then(response => setHistoriqueTransferts(response.data));
  };

  const handleValidation = (id, statut) => {
    axios.put(`/api/transfert/valider/${id}`, { statut })
      .then(() => {
        toast.success(`Transfert ${statut.toLowerCase()} avec succès.`);
        fetchHistoriqueTransferts();
      }).catch(() => toast.error('Erreur de validation.'));
  };

  const openReceptionModal = (id) => {
    setTransfertId(id);
    setShowModalReception(true);
  };

  const filteredTransferts = historiqueTransferts.filter(transfert =>
    statutFiltre ? transfert.statut === statutFiltre : true
  );

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue p-3">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3 bg-light shadow rounded">
            <h2 className='alert alert-success text-center'>Transfert Inter-Entrepôts</h2>
            
            <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>Nouveau Transfert</button>

            <h3>Historique des Transferts</h3>
            <label>Filtrer par Statut:</label>
            <select className="form-control" value={statutFiltre} onChange={(e) => setStatutFiltre(e.target.value)}>
              <option value="">Tous</option>
              <option value="En attente">En attente</option>
              <option value="Validé">Validé</option>
              <option value="Rejeté">Rejeté</option>
            </select>

            <table className="table table-bordered table-striped">
              <thead className="thead-dark">
                <tr>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Date</th>
                  <th>Statut</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransferts.map((transfert) => (
                  <tr key={transfert._id}>
                    <td>{transfert.entrepotSource?.nom || 'N/A'}</td>
                    <td>{transfert.entrepotDestination?.nom || 'N/A'}</td>
                    <td>{transfert.produit?.nom || 'N/A'}</td>
                    <td>{transfert.quantité}</td>
                    <td>{new Date(transfert.dateTransfert).toLocaleDateString()}</td>
                    <td>{transfert.statut}</td>
                    <td>
                      {transfert.statut === 'En attente' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => handleValidation(transfert._id, 'Validé')}>Valider</button>
                          <button className="btn btn-danger btn-sm ml-2" onClick={() => handleValidation(transfert._id, 'Rejeté')}>Rejeter</button>
                        </>
                      )}
                      {transfert.statutAdmin === 'approuvé' && transfert.statutEntrepotDestination !== 'reçu' && (
                        <button className="btn btn-primary btn-sm" onClick={() => openReceptionModal(transfert._id)}>
                          Recevoir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {showModal && <TransfertModal show={showModal} handleClose={() => setShowModal(false)} refreshHistorique={fetchHistoriqueTransferts} entrepotSource={entrepot} />}
      
      {showModalReception && (
        <ReceptionModal
          show={showModalReception}
          handleClose={() => setShowModalReception(false)}
          transfertId={transfertId}
          refreshHistorique={fetchHistoriqueTransferts}
        />
      )}
    </main>
  );
};

export default Transfert;
