import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import axios from "../api/axios"; // Assure-toi que le chemin est correct

const DonutChart = () => {
  const [data, setData] = useState({
    produitsLesPlusVendus: [],
    autresProduits: []
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    axios.get('/api/paiement/prod')
      .then(response => {
        const { produitsLesPlusVendus, autresProduits } = response.data;

        setData({
          produitsLesPlusVendus,
          autresProduits
        });

        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des produits les plus vendus:", error);
        setErrorMessage("Impossible de charger les données.");
        setLoading(false);
      });
  }, []);
  // Préparer les données pour le graphique
  const options = {
    chart: {
      type: 'donut',
      toolbar: {
        show: false, // Supprime la barre d'outils
      },
    },
    legend: {
      show: true, // Assurer que la légende est visible
      position: 'bottom',
      labels: {
        useSeriesColors: true,
        fontSize: '14px', // Taille de la police de la légende
        colors: ['#333'], // Couleur de la légende
      },
    },
    tooltip: {
      enabled: true,
      style: {
        fontSize: '12px', // Taille de la police du tooltip
        fontFamily: 'Arial, sans-serif', // Police de la tooltip
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%', // Réduire la taille du donut pour plus d'espace au centre
          background: '#f1f1f1', // Ajouter un fond léger
        },
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '16px', // Taille de la police des labels à l'intérieur du donut
        fontWeight: 'bold', // Mettre en gras les labels
        colors: ['#fff'], // Couleur du texte des labels à l'intérieur du donut
      },
    },
    colors: ['#1E90FF', '#FF6347', '#FFD700', '#32CD32', '#8A2BE2', '#FF1493'], // Couleurs modifiées pour plus de diversité
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'linear',
        shadeIntensity: 0.5,
        gradientToColors: ['#1E90FF', '#FF6347', '#FFD700', '#32CD32', '#8A2BE2'], // Dégradé subtil entre ces couleurs
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    stroke: {
      width: 5, // Largeur de la bordure autour du donut
      colors: ['#fff'], // Bordure blanche autour du donut
    },
    title: {
      text: 'Répartition des Produits', // Titre du graphique
      align: 'center', // Aligner le titre au centre
      style: {
        fontSize: '20px', // Taille du texte du titre
        fontWeight: 'bold',
        color: '#333', // Couleur du titre
      },
    },
  };

  // Préparer les séries et les labels
  const series = [
    ...data.produitsLesPlusVendus.map(produit => produit.totalVendu),
    ...data.autresProduits.map(produit => produit.totalVendu)
  ];

  const labels = [
    ...data.produitsLesPlusVendus.map(produit => produit.nom),
    'Autres Produits'
  ];

  return (
    <div>
    {loading ? (
      <div className="loading-container" style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    ) : errorMessage ? (
      <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
        <p>{errorMessage}</p>
      </div>
    ) : data.produitsLesPlusVendus.length > 0 || data.autresProduits.length > 0 ? (
      <Chart options={{ ...options, labels }} series={series} type="donut" height="400" />
    ) : (
      <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Aucune donnée disponible</p>
      </div>
    )}
  </div>
  );
};

export default DonutChart;
