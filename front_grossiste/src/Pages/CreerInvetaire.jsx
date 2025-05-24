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
  const [filtreFournisseur, setFiltreFournisseur] = useState("");
  const [loadingEntrepots, setLoadingEntrepots] = useState(false);
  const [filtreProduit, setFiltreProduit] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userid");
  const [fournisseurs, setFournisseurs] = useState([]);

  useEffect(() => {
    const fetchEntrepots = async () => {
      try {
        const response = await axios.get("/api/entrepot");
        setEntrepots(response.data || []);
      } catch (error) {
        toast.error("Erreur lors de la récupération des entrepôts.");
      }
    };
    fetchEntrepots();
  }, []);

  useEffect(() => {
    const fetchFournisseurs = async () => {
      try {
        const response = await axios.get("/api/fournisseurs/tous");
        setFournisseurs(response.data || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des fournisseurs", error);
      }
    };
    fetchFournisseurs();
  }, []);

  useEffect(() => {
    if (!selectedEntrepot) return;
    const fetchEntrepotAndStocks = async () => {
      setLoading(true);
      try {
        setLoadingEntrepots(true);
        const entrepotResponse = await axios.get(`/api/entrepot/${selectedEntrepot}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEntrepot(entrepotResponse.data);
        const stocksResponse = await axios.get(`/api/stocks/stocks/${selectedEntrepot}`);
        setStocks(stocksResponse.data || []);
        console.log("reoute",stocksResponse.data);
      } catch (error) {
        toast.error('Erreur lors du chargement des données.');
        setError('Erreur lors du chargement des données.');
      } finally {
        setLoading(false);
        setLoadingEntrepots(false);
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
    setLoadingAction(true);

    if (!selectedProduct) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez sélectionner un produit avant d’enregistrer l’inventaire.',
      });
      setLoadingAction(false);
      return;
    }

    if (!quantiteFinale || isNaN(quantiteFinale)) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez entrer une quantité finale valide.',
      });
      setLoadingAction(false);
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
        const { inventaire } = response.data;
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: `Inventaire enregistré avec succès ! Nombre: ${inventaire.nombreInventaire}, Prix: ${inventaire.prixInventaire}`,
        }).then(() => {
          navigate('/inventaire');
          window.location.reload();
        });
      } else {
        toast.error("Erreur lors de l'enregistrement.");
      }
    } catch (error) {
      console.error('Erreur:', error.response?.data || error.message);
      toast.error("Erreur lors de la communication avec le serveur.");
    } finally {
      setLoadingAction(false);
    }
  };

  // 🔍 Appliquer les filtres ici
  const stocksFiltres = stocks.filter(stock => {
    const produitMatch = stock.produit.nom.toLowerCase().includes(filtreProduit.toLowerCase());
    const fournisseurNom = stock.produit.fournisseur?.nom || "";
    const fournisseurMatch = !filtreFournisseur || fournisseurNom === filtreFournisseur;
    return produitMatch && fournisseurMatch;
  });

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
              <div className="filters mb-4 d-flex justify-content-between align-items-center">
                <h6><i className="fa fa-truck"></i> Sélection de l'entrepôt :</h6>
              
                <select className="form-select me-2 " value={selectedEntrepot} onChange={handleEntrepotChange}>
                  <option value="">Choisir un entrepôt</option>
                  {entrepots.map(entrepotItem => (
                    <option key={entrepotItem._id} value={entrepotItem._id}>
                      {entrepotItem.nom}
                    </option>
                  ))}
                </select>

                <select className="form-select me-2 mt-2" value={filtreFournisseur} onChange={e => setFiltreFournisseur(e.target.value)}>
                  <option value="">Filtrer par Fournisseur</option>
                  {fournisseurs.map(f => (
                    <option key={f._id} value={f.nom}>{f.nom}</option>
                  ))}
                </select>

                <input
                  type="text"
                  className="form-control me-2 mt-2"
                  value={filtreProduit}
                  onChange={e => setFiltreProduit(e.target.value)}
                  placeholder="Filtrer par nom de produit"
                />
              </div>

              {loadingEntrepots ? (
  <div className="loading-container">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Chargement...</span>
    </div>
  </div>
) : !selectedEntrepot ? (
  <div className="alert alert-warning mt-3">
    Veuillez choisir un entrepôt pour afficher les produits.
  </div>
) : stocksFiltres.length === 0 ? (
  <div className="alert alert-info mt-3">
    Aucun produit trouvé pour cet entrepôt.
  </div>
) : (
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
      {stocksFiltres.map(stock => (
        <tr key={stock._id}>
          <td>{stock.produit.codeProduit}</td>
          <td>{stock.produit.nom}</td>
          <td>{stock.quantite}</td>
          <td>{stock.unite}</td>
          <td>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setQuantiteInitiale(stock.quantite);
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

            <div className="ajoutPersonnel">
              <form onSubmit={handleSubmit} className="mt-4">
                <div className="d-flex mb-4">
                  <div className="flex-fill me-2">
                    <label className="form-label">Quantité Initiale</label>
                    <input type="number" className="form-control" value={quantiteInitiale} readOnly />
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
                </div>
                <div className="flex-fill mb-4">
                  <label className="form-label">Raison d'Ajustement</label>
                  <textarea
                    className="form-control"
                    style={{ height: "15vh" }}
                    value={raisonAjustement}
                    onChange={(e) => setRaisonAjustement(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn15 btn-success me-2" disabled={loadingAction}>
                  {loadingAction ? (
                    <div className="spinner-border text-light" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  ) : (
                    <span><i className='fa fa-check-circle'></i> Enregistrer l'Inventaire</span>
                  )}
                </button>
                <button type="button" className="btn15 btn-warning" onClick={() => navigate('/inventaire')}>
                  Annuler
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default CreerInventaire;
