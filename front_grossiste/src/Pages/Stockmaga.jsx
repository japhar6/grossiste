import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/Stock.css';
import Sidebar from '../Components/SidebarMagasinier';
import Header from '../Components/NavbarM';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Stock() {
  const [entrepot, setEntrepot] = useState(null);
  const [magasinier, setMagasinier] = useState('');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('nom'); 

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userid");
  const nom = localStorage.getItem("nom");

  useEffect(() => {
    const fetchEntrepot = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/entrepot/recuperer/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEntrepot(response.data); // Stocke directement l'objet au lieu d'un tableau
      } catch (error) {
        toast.error('Erreur lors du chargement de l\'entrepôt.');
        console.error(error);
      }
    };

    fetchEntrepot();
  }, [token, userId]);

  useEffect(() => {
    if (!entrepot) return;

    const fetchStocks = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`http://localhost:5000/api/stocks/stocks/${entrepot._id}`);
        setStocks(response.data);
      } catch (err) {
        toast.error('Erreur lors du chargement des stocks.');
        setError('Erreur lors du chargement des stocks.');
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [entrepot]);

  const filteredStocks = stocks.filter(stock => {
    return (
      stock.produit && 
      (search === '' || stock.produit.nom.toLowerCase().includes(search.toLowerCase())) &&
      (selectedCategory === '' || stock.produit.categorie === selectedCategory) &&
      (dateFilter === '' || new Date(stock.dateEntree).toISOString().split('T')[0] === dateFilter)
    );
  });

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    if (!a.produit || !b.produit) return 0;
    if (sortBy === 'nom') {
      return a.produit.nom.localeCompare(b.produit.nom);
    } else if (sortBy === 'quantité') {
      return a.quantité - b.quantité;
    } else if (sortBy === 'date') {
      return new Date(a.dateEntree) - new Date(b.dateEntree);
    }
    return 0;
  });

  return (
    <>
      <ToastContainer />
      <main className='center'>
        <Sidebar />
        <section className='contenue'>
          <Header />
          <div className="mini-stat p-3 content">
            <h5 className='alert alert-success'>
              <i className='fa fa-line-chart'></i> Stock
            </h5>

            <div className="entrepot-magasinier-container mt-3">
  <div className="entrepot-info">
    <strong>Entrepôt :</strong> {entrepot ? entrepot.nom : "Aucun entrepôt"}
  </div>

  <div className="magasinier-info">
    <strong>Magasinier :</strong> {nom || 'Aucun'}
  </div>
</div>

            <div className="filters mt-3 d-flex justify-content-between" style={{ display: 'flex', gap: '10px' }}>
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
                {[...new Set(stocks.map(stock => stock.produit?.categorie))].map(categorie => (
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
              </select>
            </div>

            {loading ? (
              <p className="text-center mt-3">Chargement des stocks...</p>
            ) : error ? (
              <p className="text-danger mt-3">{error}</p>
            ) : sortedStocks.length > 0 ? (
              <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                <table className="tableSt mt-3">
                  <thead>
                    <tr>
                      <th onClick={() => setSortBy('codeProduit')}>Référence</th>
                      <th onClick={() => setSortBy('nom')}>Produit</th>
                      <th onClick={() => setSortBy('quantité')}>Quantité</th>
                      <th>Unité</th>
                      <th>Catégorie</th>
                      <th onClick={() => setSortBy('date')}>Date d'ajout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStocks.map(stock => (
                      <tr key={stock._id}>
                        <td>{stock.produit?.codeProduit || 'N/A'}</td>
                        <td>{stock.produit?.nom || 'N/A'}</td>
                        <td>{stock.quantité}</td>
                        <td>{stock.produit?.unite || 'N/A'}</td>
                        <td>{stock.produit?.categorie || 'N/A'}</td>
                        <td>{stock.dateEntree ? new Date(stock.dateEntree).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : entrepot ? (
              <p className="text-center mt-3">Aucun stock trouvé.</p>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}

export default Stock;
