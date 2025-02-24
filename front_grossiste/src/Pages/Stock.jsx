import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import '../Styles/Stock.css';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Stock() {
  const [entrepots, setEntrepots] = useState([]);
  const [selectedEntrepot, setSelectedEntrepot] = useState(null);
  const [magasinier, setMagasinier] = useState('');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('nom'); 

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchEntrepots = async () => {
      try {
        const response = await axios.get('/api/entrepot', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntrepots(response.data);
      } catch (error) {
        toast.error('Erreur lors du chargement des entrepôts.');
        console.error(error);
      }
    };

    fetchEntrepots();
  }, [token]);

  const handleEntrepotChange = async (event) => {
    const entrepotId = event.target.value;
    const selected = entrepots.find(e => e._id === entrepotId);

    setSelectedEntrepot(entrepotId);
    setMagasinier(selected ? selected.magasinier.nom : '');
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/stocks/stocks/${entrepotId}`);
      setStocks(response.data);
    } catch (err) {
      toast.error('Erreur lors du chargement des stocks.');
      setError('Erreur lors du chargement des stocks.');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter(stock => {
    return (
      (search === '' || stock.produit.nom.toLowerCase().includes(search.toLowerCase())) &&
      (selectedCategory === '' || stock.produit.categorie === selectedCategory) &&
      (dateFilter === '' || new Date(stock.dateEntree).toISOString().split('T')[0] === dateFilter)
    );
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (sortBy === 'nom') {
      return a.produit.nom.localeCompare(b.produit.nom);
    } else if (sortBy === 'quantité') {
      return a.quantité - b.quantité;
    } else if (sortBy === 'date') {
      return new Date(a.dateEntree) - new Date(b.dateEntree);
    } else if (sortBy === 'rupture') {
      return a.quantité < a.produit.quantiteMinimum ? -1 : 1;
    }
    return 0;
  }).filter(stock => sortBy !== 'rupture' || stock.quantité < stock.produit.quantiteMinimum);

  return (
    <>
      <ToastContainer />
      <main className='center'>
        <Sidebar />
        <section className='contenue'>
          <Header />
          <div className=" mini-statr p-3 content">
            <h5 className='alert alert-success'>
              <i className='fa fa-line-chart'></i> Stock
            </h5>

            <div className="form-group">
              <label htmlFor="entrepotSelect">Sélectionner un entrepôt :</label>
              <select id="entrepotSelect" className="form-control" onChange={handleEntrepotChange}>
                <option value="">-- Choisir un entrepôt --</option>
                {entrepots.map(entrepot => (
                  <option key={entrepot._id} value={entrepot._id}>
                    {entrepot.nom}
                  </option>
                ))}
              </select>
            </div>

            {selectedEntrepot && (
              <div className="alert alert-info mt-3">
                <strong>Gere par le Magasinier :</strong> {magasinier || 'Aucun'}
              </div>
            )}

            {selectedEntrepot && (
              <div className="filters mt-3 d-flex justify-content-between"  style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-control mr-2"
                  placeholder="Rechercher un produit..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="form-control mr-2"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">-- Filtrer par catégorie --</option>
                  {[...new Set(stocks.map(stock => stock.produit.categorie))].map(categorie => (
                    <option key={categorie} value={categorie}>{categorie}</option>
                  ))}
                </select>
                <input
                  type="date"
                  className="form-control mr-2"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                <select
                  className="form-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="nom">Trier par Nom</option>
                  <option value="quantité">Trier par Quantité</option>
                  <option value="date">Trier par Date d'Entrée</option>
                  <option value="rupture">Produit en rupture</option>
                </select>
              </div>
            )}

            {loading ? (
              <p className="text-center mt-3">Chargement des stocks...</p>
            ) : error ? (
              <p className="text-danger mt-3">{error}</p>
            ) : selectedEntrepot && sortedStocks.length > 0 ? (

              <div className="table-container" style={{ overflowX: 'auto',overflowY:'auto' }}>
              <table className="tableSt mt-3">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Unité</th>
                    <th>Catégorie</th>
                    <th>Quantite Minimum</th>
                    <th>Date d'ajout</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStocks.map(stock => (
                    <tr key={stock._id} className={stock.quantité < stock.produit.quantiteMinimum ? 'stock-low' : ''}>
                      <td>{stock.produit.codeProduit}</td>
                      <td>{stock.produit.nom}</td>
                      <td>{stock.quantité}</td>
                      <td>{stock.produit.unite}</td>
                      <td>{stock.produit.categorie}</td>
                      <td>{stock.produit.quantiteMinimum}</td>
                      <td>{new Date(stock.dateEntree).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ) : selectedEntrepot ? (
              <p className="text-center mt-3">Aucun stock trouvé.</p>
            ) : null}
          </div>
        </section>
      </main>
      <style>{`
.stock-low {
  animation: blink 0.6s infinite alternate ease-in-out;
  background-color: #f8d7da !important; /* Rose clair pour une alerte */
  color: #721c24; /* Rouge foncé pour le texte */
  font-weight: bold;
  border-radius: 5px;
  padding: 10px;
  border: 1px solid #f5c6cb; /* Bordure rouge clair */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 10px 0; /* Espacement en haut et en bas */
}

@keyframes blink {
  0% { background-color: #f8d7da; opacity: 1; }
  50% { background-color: #f5c6cb; opacity: 0.8; }
  100% { background-color: #f8d7da; opacity: 1; }
}

      `}</style>
    </>
  );
}

export default Stock;
