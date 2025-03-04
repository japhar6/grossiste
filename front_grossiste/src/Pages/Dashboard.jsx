import React, { useState, useEffect } from 'react';
import '../Styles/Dashboard.css';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';
import LineChart from '../Components/LineChart';
import DonutChart from '../Components/DonutChart';
import ClientCredi from '../Components/ClientCredi';
import axios from '../api/axios';

function Dashboard() {
  const [fournisseursCount, setFournisseursCount] = useState(0);
  const [produitCount, setProduitCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [commandeCount, setCommandeCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // ✅ Active le mode chargement avant de faire les requêtes

      try {
        const [fournisseursRes, commandesRes, clientsRes, produitsRes] = await Promise.all([
          axios.get('/api/fournisseurs/count'),
          axios.get('/api/commandes/count'),
          axios.get('/api/client/count'),
          axios.get('/api/produits/count')
        ]);

        setFournisseursCount(fournisseursRes.data.totalFournisseurs);
        setCommandeCount(commandesRes.data.totalcommande);
        setClientCount(clientsRes.data.totalclient);
        setProduitCount(produitsRes.data.totalProduits);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des statistiques.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <header></header>
      <main className='center'>
        <Sidebar />
        <section className='contenue'>
          <Header />

          {/* ✅ Affichage du chargement */}
          {loading ? (
            <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
    <span className="visually-hidden">Chargement...</span>
  </div>
            </div>
          ) : error ? ( // ✅ Affichage de l'erreur
            <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="fa fa-exclamation-triangle me-2"></i> {error}
            <button className="btn btn-outline-danger btn-sm ms-auto" onClick={() => window.location.reload()}>
              Réessayer
            </button>
          </div>
          ) : ( // ✅ Affichage des données une fois chargées
            <>
             <div className="stats-container">
                <div className="stat-card bg-success text-light">
                  <h1>
                    <i className="fa fa-users"></i> {clientCount}
                  </h1>
                  <h6>Clients</h6>
                </div>
                <div className="stat-card bg-primary">
                  <h1>
                    <i className="fa fa-truck"></i> {fournisseursCount}
                  </h1>
                  <h6>Fournisseurs</h6>
                </div>
                <div className="stat-card bg-secondary">
                  <h1>
                    <i className="fa fa-shopping-cart"></i> {commandeCount}
                  </h1>
                  <h6>Commandes</h6>
                </div>
                <div className="stat-card bg-success">
                  <h1>
                    <i className="fa fa-box"></i> {produitCount}
                  </h1>
                  <h6>Articles</h6>
                </div>
              </div>
              <div className="charts-wrapper">
                <div className="chart-box">
                  <LineChart />
                </div>
                <div className="chart-box">
                  <DonutChart />
                </div>
              </div>
              <div className="p-5 bg-light mt-4">
                <ClientCredi />
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default Dashboard;
