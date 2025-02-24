import React, { useState, useEffect } from 'react';
import '../Styles/Dashboard.css';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';
import LineChart from '../Components/LineChart';
import DonutChart from '../Components/DonutChart';
import axios from '../api/axios';

function Dashboard() {
  const [fournisseursCount, setFournisseursCount] = useState(0);
  const [produitCount, setproduitCount] = useState(0);
  const [clientCount, setclientCount] = useState(0);
  const [commandeCount, setcommandeCount] = useState(0);
  
  useEffect(() => {
    // Fonction pour récupérer le nombre de fournisseurs
    const fetchFournisseursCount = async () => {
      try {
        const response = await axios.get('/fournisseurs/count');
        const data = response.data;
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
        const response = await axios.get('/commandes/count');
        const data = response.data;
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
        const response = await axios.get('/client/count');
        const data = response.data;
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
        const response = await axios.get('/produits/count');
        const data = response.data;
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
      <main className='center'>
        <Sidebar />
        <section className='contenue'>
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

