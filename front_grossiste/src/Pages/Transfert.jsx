import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import Sidebar from "../Components/SidebarMagasinier";
import Header from "../Components/NavbarM";
import '../Styles/Transfert.css'
const Transfert = () => {
  const [entrepots, setEntrepots] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [entrepot, setEntrepot] = useState(null);
  const [entrepotDestination, setEntrepotDestination] = useState('');
  const [produit, setProduit] = useState('');
  const [quantite, setQuantite] = useState('');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [historiqueTransferts, setHistoriqueTransferts] = useState([]);
  const [filtreEntrepotSource, setFiltreEntrepotSource] = useState('');
const [filtreEntrepotDestination, setFiltreEntrepotDestination] = useState('');
const [filtreProduit, setFiltreProduit] = useState('');
const [filtreDate, setFiltreDate] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userid");
    axios.get(`/entrepot/recuperer/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(response => setEntrepot(response.data))
      .catch(() => toast.error("Erreur lors du chargement de l'entrepôt."));
  }, []);

  useEffect(() => {
    if (!entrepot) return;
    axios.get(`/stocks/stocks/${entrepot._id}`)
      .then(response => setStocks(response.data))
      .catch(() => toast.error("Erreur lors du chargement des stocks."));
  }, [entrepot]);

  useEffect(() => {
    axios.get('/entrepot')
      .then(response => setEntrepots(response.data));
    fetchHistoriqueTransferts();
  }, []);

  const fetchHistoriqueTransferts = () => {
    axios.get('/transfert/recup')
      .then(response => setHistoriqueTransferts(response.data));
  };

  const handleProduitChange = (e) => {
    const produitId = e.target.value;
    setProduit(produitId);
    const selectedStock = stocks.find(stock => stock.produit._id === produitId);
    setPrixUnitaire(selectedStock ? selectedStock.prixUnitaire : '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/transfert/transfert', {
      entrepotSource: entrepot._id,
      entrepotDestination,
      produit,
      quantite,
      prixUnitaire,
    }).then(response => {
      toast.success(response.data.message);
      fetchHistoriqueTransferts();
    }).catch(() => toast.error('Erreur lors du transfert.'));
  };
  const filteredTransferts = historiqueTransferts.filter((transfert) => {
    const matchesSource = filtreEntrepotSource ? transfert.entrepotSource._id === filtreEntrepotSource : true;
    const matchesDestination = filtreEntrepotDestination ? transfert.entrepotDestination._id === filtreEntrepotDestination : true;
    const matchesProduit = filtreProduit ? transfert.produit._id === filtreProduit : true;
    const matchesDate = filtreDate ? new Date(transfert.dateTransfert).toLocaleDateString() === new Date(filtreDate).toLocaleDateString() : true;
  
    return matchesSource && matchesDestination && matchesProduit && matchesDate;
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
          <div className="filtre-container mb-3 d-flex flex-wrap">
  <div className="form-group flex-fill">
    <label>Filtrer par Entrepôt Source:</label>
    <select className="form-control" value={filtreEntrepotSource} onChange={(e) => setFiltreEntrepotSource(e.target.value)}>
      <option value="">Tous</option>
      {entrepots.map((ent) => (
        <option key={ent._id} value={ent._id}>{ent.nom}</option>
      ))}
    </select>
  </div>

  <div className="form-group flex-fill">
    <label>Filtrer par Entrepôt Destination:</label>
    <select className="form-control" value={filtreEntrepotDestination} onChange={(e) => setFiltreEntrepotDestination(e.target.value)}>
      <option value="">Tous</option>
      {entrepots.map((ent) => (
        <option key={ent._id} value={ent._id}>{ent.nom}</option>
      ))}
    </select>
  </div>

  <div className="form-group flex-fill">
    <label>Filtrer par Produit:</label>
    <select className="form-control" value={filtreProduit} onChange={(e) => setFiltreProduit(e.target.value)}>
      <option value="">Tous</option>
      {stocks.map((stock) => (
        <option key={stock.produit._id} value={stock.produit._id}>
          {stock.produit.nom}
        </option>
      ))}
    </select>
  </div>

  <div className="form-group flex-fill">
    <label>Filtrer par Date de Transfert:</label>
    <input type="date" className="form-control" value={filtreDate} onChange={(e) => setFiltreDate(e.target.value)} />
  </div>
</div>


          <div className="table-container" style={{ overflowX: 'auto',overflowY:'auto' }}>
                
          <table className="table table-bordered table-striped">
            <thead className="thead-dark">
              <tr>
                <th>Entrepôt Source</th>
                <th>Entrepôt Destination</th>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Date de Transfert</th>
              </tr>
            </thead>
            <tbody>
  {filteredTransferts.length > 0 ? (
    filteredTransferts.map((transfert) => (
      <tr key={transfert._id}>
        <td>{transfert.entrepotSource?.nom || 'N/A'}</td>
        <td>{transfert.entrepotDestination?.nom || 'N/A'}</td>
        <td>{transfert.produit?.nom || 'N/A'}</td>
        <td>{transfert.quantité}</td>
        <td>{new Date(transfert.dateTransfert).toLocaleDateString()}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" className="text-center">Aucun transfert enregistré.</td>
    </tr>
  )}
</tbody>

          </table>
        </div>  </div>
        <div className="ajoutPersonnel ">
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="form-group">
              <label>Entrepôt Source:</label>
              <input type="text" className="form-control" value={entrepot ? entrepot.nom : 'Aucun entrepôt disponible'} readOnly />
            </div>

            <div className="form-group">
  <label>Entrepôt Destination:</label>
  <select className="form-control" value={entrepotDestination} onChange={(e) => setEntrepotDestination(e.target.value)} required>
    <option value="">Sélectionnez un entrepôt</option>
    {entrepots.map((ent) => (
      ent._id !== (entrepot ? entrepot._id : null) && (
        <option key={ent._id} value={ent._id}>{ent.nom}</option>
      )
    ))}
  </select>
</div>


            <div className="form-group">
              <label>Produit:</label>
              <select className="form-control" value={produit} onChange={handleProduitChange} required>
                <option value="">Sélectionner un produit</option>
                {stocks.map((stock) => (
                  <option key={stock.produit._id} value={stock.produit._id}>
                    {stock.produit.nom} - {stock.quantité} en stock
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Quantité:</label>
              <input type="number" className="form-control" value={quantite} onChange={(e) => setQuantite(e.target.value)} required min="1" />
            </div>

            <div className="form-group">
              <label>Prix Unitaire:</label>
              <input type="text" className="form-control" value={prixUnitaire} readOnly />
            </div>

            <button type="submit" className="btn btn-primary w-100">Transférer</button>
          </form>
        </div> </div>
      </section>
    </main>
  );
};

export default Transfert;
