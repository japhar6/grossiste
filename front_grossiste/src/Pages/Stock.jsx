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
  const [uniteSelectionnee, setUniteSelectionnee] = useState({});
  const [quantitesInitiales, setQuantitesInitiales] = useState({});
  const [quantiteAffichee, setQuantiteAffichee] = useState({});
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('nom');
  const [notifiedProducts, setNotifiedProducts] = useState([]); // Nouveau state pour gérer les produits notifiés

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
  }, []);

  useEffect(() => {
    const checkAndSendNotification = () => {
      const today = new Date().toISOString().split('T')[0];
    
      const ruptureDeStock = stocks.filter(stock => 
        stock.quantite < stock.produit.quantiteMinimum && 
        !notifiedProducts.includes(stock.produit._id) &&
        !isNotificationSentToday(stock.produit._id, today)
      );
    
      if (ruptureDeStock.length > 0) {
        ruptureDeStock.forEach(stock => {
          if (stock.produit && stock.produit.nom && stock.quantite !== undefined) {
            const data = {
              "produit": stock.produit.nom,
              "quantiteRestante": String(stock.quantite),
              "entrepot": selectedEntrepot ? selectedEntrepot.nom : "Inconnu" // Ajout du nom de l'entrepôt
            };
    
            console.log(data);
    
            axios.post('/api/notif/rupture-stock', data)
              .then(response => {
                toast.warn(`Attention : Rupture de stock sur ${stock.produit.nom} dans l'entrepôt ${selectedEntrepot ? selectedEntrepot.nom : "Inconnu"} !`);
                
                setNotifiedProducts(prevState => [...prevState, stock.produit._id]);
                localStorage.setItem('notifiedProducts', JSON.stringify([...notifiedProducts, stock.produit._id]));
    
                storeNotificationSent(stock.produit._id, today);
              })
              .catch(error => {
                console.error('Erreur lors de l\'envoi de la notification :', error.response?.data || error);
                toast.error('Erreur lors de l\'envoi de la notification de rupture de stock.');
              });
          } else {
            console.error("Produit ou quantité non définis:", stock);
          }
        });
      }
    };
    
    
    // Fonction pour vérifier si une notification a déjà été envoyée aujourd'hui
    const isNotificationSentToday = (produitId, today) => {
      const notifications = JSON.parse(localStorage.getItem('sentNotifications')) || [];
      return notifications.some(notification => notification.produitId === produitId && notification.date === today);
    };
    
    // Fonction pour enregistrer l'envoi de la notification avec la date
    const storeNotificationSent = (produitId, today) => {
      const notifications = JSON.parse(localStorage.getItem('sentNotifications')) || [];
      notifications.push({ produitId, date: today });
      localStorage.setItem('sentNotifications', JSON.stringify(notifications));
    };
    
    

    checkAndSendNotification();
  }, [stocks, notifiedProducts]); // Se déclenche lorsque les stocks ou les produits notifiés changent

  const handleEntrepotChange = async (event) => {
    localStorage.removeItem('notificationSent'); // Réinitialiser la notification lorsque l'entrepôt change
    const entrepotId = event.target.value;
    const selected = entrepots.find(e => e._id === entrepotId);

    setSelectedEntrepot(entrepotId);
    setMagasinier(selected?.magasinier?.nom || '');

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/stocks/stocks/${entrepotId}`);
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
  };// Fonction pour gérer le changement d'unité
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


  const isRuptureDeStock = (stock) => {
    return stock.quantite < stock.produit.quantiteMinimum;
  };

  const filteredStocks = stocks.filter(stock => {
    return (
      (search === '' || stock.produit.nom.toLowerCase().includes(search.toLowerCase())) &&
      (selectedCategory === '' || stock.produit.categorie === selectedCategory) &&
      (dateFilter === '' || new Date(stock.dateEntree).toISOString().split('T')[0] === dateFilter)
    );
  });

  const sortedStocks = [...filteredStocks]
    .filter(stock => {
      if (sortBy === 'rupture') {
        return stock.quantite < stock.produit.quantiteMinimum; // Filtrer uniquement les ruptures
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'nom') {
        return a.produit.nom.localeCompare(b.produit.nom);
      } else if (sortBy === 'quantite') {
        return b.quantite - a.quantite;
      } else if (sortBy === 'date') {
        return new Date(b.dateEntree) - new Date(a.dateEntree);
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
          <div className="mini-statr p-3 content">
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
                <strong>Géré par le Magasinier :</strong> {magasinier || 'Aucun'}
              </div>
            )}

            {selectedEntrepot && (
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
                  <option value="quantite">Trier par Quantité</option>
                  <option value="date">Trier par Date d'Entrée</option>
                  <option value="rupture">Produit en rupture</option>
                </select>
              </div>
            )}

            {loading ? (
              <p className="text-center mt-3">Chargement des stocks...</p>
            ) : error ? (
              <p className="text-center mt-3 text-danger">{error}</p>
            ) : (
              <table className="tableSt table-bordered mt-3">
                <thead>
                  <tr>
                    <th>Nom du produit</th>
                    <th>Catégorie</th>
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
                      <td>{stock.produit.nom}</td>
                      <td>{stock.produit.categorie}</td>
                      <td>
                        {quantiteAffichee[stock.produit._id]} {uniteSelectionnee[stock.produit._id] || stock.produit.unites[0].nom}
                      </td>

                      <td>
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
                      <td>{stock.produit.quantiteMinimum}</td>
                      <td>{new Date(stock.dateEntree).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default Stock;
