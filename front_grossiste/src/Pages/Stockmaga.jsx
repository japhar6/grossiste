import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import '../Styles/Stock.css';
import Sidebar from '../Components/SidebarMagasinier';
import Header from '../Components/NavbarM';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Stock() {
  const [entrepots, setEntrepots] = useState([]); // Pour stocker la liste des entrepôts
  const [entrepot, setEntrepot] = useState(null);
  const [magasinier, setMagasinier] = useState('');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('nom'); 

    const [uniteSelectionnee, setUniteSelectionnee] = useState({});
    const [quantitesInitiales, setQuantitesInitiales] = useState({});
    const [quantiteAffichee, setQuantiteAffichee] = useState({});

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userid");
  const nom = localStorage.getItem("nom");

 
  
 const handleUniteChange = (produitId, nouvelleUnite) => {
    const produit = stocks.find(stock => stock.produit._id === produitId);
    const uniteSelectionneeProduit = produit.produit.unites.find(unite => unite.nom === nouvelleUnite);
    const uniteStockProduit = produit.produit.unites.find(unite => unite.nom === produit.unite);
    
    // Calcul de la nouvelle quantité en fonction de l'unité choisie
    const quantiteStock = quantitesInitiales[produitId];
    const conversion = uniteStockProduit.conversion / uniteSelectionneeProduit.conversion;
  
    // Si l'unité choisie est plus grande (ex: cartouche vers carton), divisez la quantité
    const nouvelleQuantite = quantiteStock / conversion;
  
    // Mettre à jour l'état avec la nouvelle quantité
    setQuantiteAffichee(prevState => ({
      ...prevState,
      [produitId]: nouvelleQuantite,
    }));
  
    // Mettre à jour l'unité sélectionnée pour ce produit
    setUniteSelectionnee(prevState => ({
      ...prevState,
      [produitId]: nouvelleUnite,
    }));
  };
  
  const convertirQuantiteMinimum = (quantiteMinimum, uniteSource, uniteCible) => {
    const source = stocks.find(stock => stock.produit.unites.find(u => u.nom === uniteSource));
    const cible = stocks.find(stock => stock.produit.unites.find(u => u.nom === uniteCible));
    if (!source || !cible) return quantiteMinimum;
    const ratio = source.produit.unites.find(u => u.nom === uniteSource).conversion /
                  cible.produit.unites.find(u => u.nom === uniteCible).conversion;
    return quantiteMinimum * ratio;
  };
  // Récupère tous les entrepôts à l'initialisation
  useEffect(() => {
    const fetchEntrepots = async () => {
      try {
        const response = await axios.get(`/api/entrepot/recuperer/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEntrepots(response.data); // Stocke la liste d'entrepôts
      } catch (error) {
        toast.error('Erreur lors du chargement des entrepôts.');
        console.error(error);
      }
    };

    fetchEntrepots();
  }, [token, userId]);

  // Récupère les stocks de l'entrepôt sélectionné
  useEffect(() => {
    if (!entrepot) return;

    const fetchStocks = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/stocks/stocks/${entrepot._id}`);
        setStocks(response.data);
        
        const defaultUnits = {};
        const initialQuantities = {};
        const initialQuantiteAffichee = {};
        response.data.forEach(stock => {
          defaultUnits[stock.produit._id] = stock.unite; // Unité par défaut
          initialQuantities[stock.produit._id] = stock.quantite; // Quantité initiale (en plus petite unité)
          initialQuantiteAffichee[stock.produit._id] = stock.quantite; // Quantité affichée
        });
        setUniteSelectionnee(defaultUnits);
        setQuantitesInitiales(initialQuantities);
        setQuantiteAffichee(initialQuantiteAffichee);



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

  // Filtre et trie les stocks
  const filteredStocks = stocks.filter(stock => {
    return (
      stock.produit && 
      (search === '' || stock.produit.nom.toLowerCase().includes(search.toLowerCase())) &&
      (selectedCategory === '' || stock.produit.categorie === selectedCategory) &&
      (dateFilter === '' || new Date(stock.dateEntree).toISOString().split('T')[0] === dateFilter)
    );
  });
  const isRuptureDeStock = (stock) => {

    return stock.quantite < stock.produit.quantiteMinimum;
  };

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

            {/* Sélecteur d'entrepôt */}
            <div className="mt-3">
              <select
                className="form-control"
                onChange={(e) => setEntrepot(entrepots.find(ent => ent._id === e.target.value))}
                defaultValue=""
              >
                <option value="">-- Sélectionner un entrepôt --</option>
                {entrepots.map((ent) => (
                  <option key={ent._id} value={ent._id}>
                    {ent.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="filters mt-3 d-flex justify-content-between" style={{ display: 'flex', gap: '10px' }}>
              {/* Champs de filtre */}
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
                <option value="rupture">Produit en rupture</option>
              </select>
            </div>

            {loading ? (
              <p className="text-center mt-3">Chargement des stocks...</p>
            ) : error ? (
              <p className="text-danger mt-3">{error}</p>
            ) : sortedStocks.length > 0 ? (
              <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                <table className="tableSt table-striped table-bordered mt-3">
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
                    <tr key={stock._id} className={isRuptureDeStock(stock) ? 'clignoter' : ''}>
                         <td>{stock.produit.codeProduit}</td>
                        <td>{stock.produit.nom}</td>
                        <td>
  {quantiteAffichee[stock.produit._id]} {uniteSelectionnee[stock.produit._id] || stock.produit.unites[0].nom}
</td>         <td>
                        <select
                          value={uniteSelectionnee[stock.produit._id] || ''}
                          onChange={(e) => handleUniteChange(stock.produit._id, e.target.value)}
                          className="form-control"
                        >
                          {stock.produit.unites.map(unite => (
                            <option key={unite.nom} value={unite.nom}>
                              {unite.nom}
                            </option>
                          ))}
                        </select>
                      </td>
                        <td>{stock.produit.categorie}</td>
                        <td>{stock.produit.quantiteMinimum} {stock.unite}</td>
                    <td>{new Date(stock.dateEntree).toLocaleDateString()}</td>
                    <td>
        {isRuptureDeStock(stock) && <span className="text-danger">Rupture de stock</span>}
      </td>
                      
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
