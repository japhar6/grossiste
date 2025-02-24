import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';
import '../Styles/CreerInventaire.css';
import axios from '../api/axios';

function CreerInventaire() {
  const [stocks, setStocks] = useState([]);
  const [quantiteInitiale, setQuantiteInitiale] = useState(0);
  const [quantiteFinale, setQuantiteFinale] = useState('');
  const [raisonAjustement, setRaisonAjustement] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [entrepots, setEntrepots] = useState([]);
  const [selectedEntrepot, setSelectedEntrepot] = useState('');
  const [entrepot, setEntrepot] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userid");

  useEffect(() => {
    const fetchEntrepots = async () => {
      try {
        const response = await axios.get("/api/entrepot");
        const data = response.data;
  
        if (Array.isArray(data) && data.length > 0) {
          setEntrepots(data);
        } else {
          toast.error("Impossible de récupérer les entrepôts.");
        }
      } catch (error) {
        toast.error("Erreur lors de la récupération des entrepôts.");
      }
    };
  
    fetchEntrepots();
  }, []);

  useEffect(() => {
    if (!selectedEntrepot) return;

    const fetchEntrepotAndStocks = async () => {
      setLoading(true);
      try {
        const entrepotResponse = await axios.get(`/api/entrepot/${selectedEntrepot}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntrepot(entrepotResponse.data);

        const stocksResponse = await axios.get(`/api/stocks/stocks/${selectedEntrepot}`);
        setStocks(stocksResponse.data);
        setLoading(false);
      } catch (error) {
        toast.error('Erreur lors du chargement des données.');
        setError('Erreur lors du chargement des données.');
        setLoading(false);
      }
    };

    fetchEntrepotAndStocks();
  }, [selectedEntrepot, token]);

  const handleEntrepotChange = (e) => {
    setSelectedEntrepot(e.target.value);
    setStocks([]);
    setSelectedProduct(null);
    setQuantiteInitiale(0);
    setQuantiteFinale('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez sélectionner un produit avant d’enregistrer l’inventaire.',
      });
      return;
    }

    if (!quantiteFinale || isNaN(quantiteFinale)) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez entrer une quantité finale valide.',
      });
      return;
    }

    const quantiteFinaleNum = parseInt(quantiteFinale, 10);
    const quantitePerdue = quantiteInitiale - quantiteFinaleNum;

    const inventaireData = {
      entrepot: entrepot._id,
      produit: selectedProduct.produit._id,
      quantiteInitiale,
      quantiteFinale: quantiteFinaleNum,
      quantitePerdue,
      raisonAjustement,
      personneId: userId,
      date: new Date(),
    };

    try {
      const response = await axios.post('/api/inventaire/ajouter', inventaireData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Inventaire enregistré avec succès !',
        }).then(() => {
          navigate('/inventaire');
          window.location.reload();
        });
      } else {
        toast.error('Erreur lors de l\'enregistrement de l\'inventaire.');
      }
    } catch (error) {
      console.error('Erreur:', error.response ? error.response.data : error.message);
      toast.error('Erreur lors de la communication avec le serveur.');
    }
  };

  return (
    <>
      <ToastContainer />
      <main className='center'>
        <Sidebar />
        <section className='contenue'>
          <Header />
          <div className="p-3 content center">
            <div className="mini-stat p-3 bg-light shadow rounded">
              <h5 className='alert alert-success'>
                <i className='fa fa-line-chart'></i> Effectuer un Inventaire
              </h5>
              <div className="fournisseur-section">
                <h6><i className="fa fa-truck"></i> Sélection de l'entrepôt</h6>
                <select className="form-control custom-select" value={selectedEntrepot} onChange={handleEntrepotChange}>
                  <option value="">Choisir un entrepôt</option>
                  {entrepots.map(entrepotItem => (
                    <option key={entrepotItem._id} value={entrepotItem._id}>
                      {entrepotItem.nom}
                    </option>
                  ))}
                </select>
              </div>

              {loading ? <p>Chargement des stocks...</p> : (
                <table className="table table-striped table-bordered mt-3">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Unité</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map(stock => (
                      <tr key={stock._id}>
                        <td>{stock.produit.codeProduit}</td>
                        <td>{stock.produit.nom}</td>
                        <td>{stock.quantité}</td>
                        <td>{stock.produit.unite}</td>
                        <td>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setQuantiteInitiale(stock.quantité);
                              setSelectedProduct(stock);
                            }}
                          >
                            Sélectionner
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="ajoutPersonnel ">
        <form onSubmit={handleSubmit} className="mt-4">
<div className="d-flex mb-4">
  <div className="flex-fill me-2">
    <label className="form-label">Quantité Initiale</label>
    <input
      type="number"
      className="form-control"
      value={quantiteInitiale}
      readOnly
    />
  </div>
  <div className="flex-fill me-2">
    <label className="form-label">Quantité Finale</label>
    <input
      type="number"
      className="form-control"
      value={quantiteFinale}
      onChange={(e) => setQuantiteFinale(e.target.value)}
    />
  </div>
  <div className="flex-fill">
    <label className="form-label">Raison d'Ajustement</label>
    <textarea
      className="form-control"
      value={raisonAjustement}
      onChange={(e) => setRaisonAjustement(e.target.value)}
    />
  </div>
</div>

 

          <button type="submit" className="btn15 btn-success">Enregistrer l'Inventaire</button>
          <button 
  type="button" 
  className="btn15 btn-warning" 
  onClick={() => navigate('/inventaire')}
>
  Annuler
</button>

        </form>  
          </div>    </div>
        </section>
      </main>
    </>
  );
}

export default CreerInventaire;
