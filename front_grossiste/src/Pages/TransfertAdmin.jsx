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
const [dateEnd, setDateEnd] = useState("");      // Date de fin
  const [dateFilter, setDateFilter] = useState("");  // Date spécifique
  const [isDateRange, setIsDateRange] = useState(false);
const [dateStart, setDateStart] = useState("");  // Date de début
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
    const createdDate = new Date(transfert.dateTransfert).toISOString().slice(0, 10);
   
   
    const matchesStatut = statutFiltre ? transfert.statutAdmin === statutFiltre : true;
    const matchesSourceEntrepot = entrepotSourceFiltre ?
      transfert.entrepotSource?._id === entrepotSourceFiltre : true;
    const matchesDestinationEntrepot = entrepotDestinationFiltre ?
      transfert.entrepotDestination?._id === entrepotDestinationFiltre : true;
 
      const dateMatch = (dateStart && dateEnd) ?
      (createdDate >= dateStart && createdDate <= dateEnd) :
      (dateFilter ? createdDate === dateFilter : true); // Si une seule date est donnée, on filtre par celle-ci


    return dateMatch && matchesStatut && matchesSourceEntrepot && matchesDestinationEntrepot ;
  });

  const handlePrint = () => {
    const printContent = document.getElementById("table-to-print").outerHTML;
    const printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write('<html><head><title>Impression des inventaires</title>');
    printWindow.document.write(`
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          padding: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 8px;
          text-align: left;
          border: 1px solid #ddd;
        }
        th {
          background-color: #f4f4f4;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
      </style>
    `);
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>Inventaires filtrés</h1>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue p-3">
        <Header />
        <div className="p-3 content center">
          <div className="mini-stat p-3 bg-light shadow rounded">
            <h2 className='alert alert-success text-center'>Transfert Inter-Entrepôts</h2>
            <h3>Historique des Transferts</h3>
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
              
              
              <div className="col-md-4 mb-3">
           
                <select className="form-control" value={statutFiltre} onChange={(e) => setStatutFiltre(e.target.value)}>
                  <option value="">Filtrer par Statut</option>
                  <option value="en attente">En attente</option>
                  <option value="approuvé">Validé</option>
                  <option value="rejeté">Rejeté</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                
                <select className="form-control" value={entrepotSourceFiltre} onChange={(e) => setEntrepotSourceFiltre(e.target.value)}>
                  <option value="">Filtrer par Entrepôt Source</option>
                  {entrepots.map(entrepot => (
                    <option key={entrepot._id} value={entrepot._id}>{entrepot.nom}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4 mb-3">
             
                <select className="form-control" value={entrepotDestinationFiltre} onChange={(e) => setEntrepotDestinationFiltre(e.target.value)}>
                  <option value="">Filtrer par Entrepôt Destination</option>
                  {entrepots.map(entrepot => (
                    <option key={entrepot._id} value={entrepot._id}>{entrepot.nom}</option>
                  ))}
                </select>
              </div>

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
                  </div> </div> </div>

            <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
              {loadingEntrepots ? (
                <div className="loading-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                <table className="table table-bordered table-striped"  id="table-to-print">
                  <thead className="thead-dark">
                    <tr>
                      <th>Source</th>
                      <th>Destination</th>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Unité</th>
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
                        <td>
        {
            transfert.produit?.unites?.length 
            ? transfert.produit.unites.reduce((max, unite) => unite.conversion > max.conversion ? unite : max, transfert.produit.unites[0]).nom
            : 'N/A'
        }
    </td>
                        <td>{transfert.quantitéEnvoyée}</td>
                        <td>{new Date(transfert.dateTransfert).toLocaleDateString()}</td>
                        <td>{transfert.statutAdmin}</td>
                        <td>{transfert.statutEntrepotDestination}</td>
                        <td>
                          {transfert.statutAdmin === 'en attente' && (
                            <div className="d-flex justify-content-around">
                              <button className="btn btn-success custom-button" disabled={loadingAction} style={{ marginRight: '10px' }} onClick={() => handleValidation(transfert, 'approuvé')}>
                                {loadingAction ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm"></span> Chargement...
                                  </>
                                ) : (
                                  "Valider"
                                )}
                              </button>
                              <button className="btn btn-danger custom-button" disaabled={loadingAction} onClick={() => handleValidation(transfert, 'refusé')}>
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
              </div>
            </div>
        </div>
      </section>
    </main>
  );
};

export default TransfertAdmin;
