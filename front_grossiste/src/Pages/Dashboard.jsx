import React, { useState, useEffect } from 'react';
import '../Styles/Dashboard.css';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';
import LineChart from '../Components/LineChart';
import DonutChart from '../Components/DonutChart';

function Dashboard() {
  const [fournisseursCount, setFournisseursCount] = useState(0);
  const [produitCount, setproduitCount] = useState(0);
  const [clientCount, setclientCount] = useState(0);
  const [commandeCount, setcommandeCount] = useState(0);

  useEffect(() => {
    // Fonction pour récupérer le nombre de fournisseurs
    const fetchFournisseursCount = async () => {
      try {
        const response = await fetch('http://10.152.183.99/api/fournisseurs/count');
        const data = await response.json();
        setFournisseursCount(data.totalFournisseurs);
      } catch (error) {
        console.error('Erreur lors du chargement des fournisseurs:', error);
      }
    };

    fetchFournisseursCount();
  }, []);



  useEffect(() => {
    // Fonction pour récupérer le nombre de fournisseurs
    const fetchCommandecount = async () => {
      try {
        const response = await fetch('http://10.152.183.99/api/commandes/count');
        const data = await response.json();
        setcommandeCount(data.totalcommande);
      } catch (error) {
        console.error('Erreur lors du chargement des fournisseurs:', error);
      }
    };

    fetchCommandecount();
  }, []);

  useEffect(() => {
    // Fonction pour récupérer le nombre de fournisseurs
    const fetchClientCount = async () => {
      try {
        const response = await fetch('http://10.152.183.99/api/client/count');
        const data = await response.json();
        setclientCount(data.totalclient);
        console.log("countcli",data.totalclient);
      } catch (error) {
        console.error('Erreur lors du chargement des fournisseurs:', error);
      }
    };

    fetchClientCount();
  }, []);

  useEffect(() => {
    // Fonction pour récupérer le nombre de fournisseurs
    const fetchproduitCount = async () => {
      try {
        const response = await fetch('http://10.152.183.99/api/produits/count');
        const data = await response.json();
        setproduitCount(data.totalProduits);
      } catch (error) {
        console.error('Erreur lors du chargement des fournisseurs:', error);
      }
    };

    fetchproduitCount();
  }, []);



  return (
    <>
      <header></header>
      <main className='dashboard-container'>
        <Sidebar />
        <section className='main-content scrollable'>
          <Header />
          <div className='stats-container'>
            <div className='stat-card'>
              <h1><i className='fa fa-users'></i> {clientCount}</h1>
              <h6>Clients</h6>
            </div>
            <div className='stat-card'>
              <h1><i className='fa fa-truck'></i> {fournisseursCount}</h1>
              <h6>Fournisseurs</h6>
            </div>
            <div className='stat-card'>
              <h1><i className='fa fa-shopping-cart'></i> {commandeCount}</h1>
              <h6>Commandes</h6>
            </div>
            <div className='stat-card'>  
              <h1><i className='fa fa-box'></i> {produitCount}</h1>
              <h6>Articles</h6>
            </div>
          </div>
          <div className='charts-wrapper'>
            <div className='chart-box'>
              <LineChart />
            </div>
            <div className='chart-box'>
              <DonutChart />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;

