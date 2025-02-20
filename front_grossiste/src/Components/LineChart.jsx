import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';

const LineChart = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/paiement/performance-vente'); // Ajuste l'URL si nécessaire
        const performanceData = response.data.data;

        const months = performanceData.map(item => item._id); // Extrait les mois
        const totalVentes = performanceData.map(item => item.totalMontant); // Extrait les montants totaux
        console.log(totalVentes);
        setCategories(months);
        setData(totalVentes);
      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchPerformanceData();
  }, []);

  const options = {
    chart: {
      id: 'line-chart',
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: categories.length ? categories : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'], 
    },
    yaxis: {
      tickAmount: 6, // Ajuste le nombre de ticks sur l'axe des ordonnées
      min: 0, // Valeur minimale
      // max: Math.max(...data) + 500, // Valeur maximale (ajuster si nécessaire)
    },
    stroke: {
      curve: 'smooth',
    },
    title: {
      text: 'Performance des ventes par mois  ', // Titre du graphique
      align: 'center', // Aligner le titre au centre
      style: {
        fontSize: '20px', // Taille du texte du titre
        fontWeight: 'bold',
        color: '#333', // Couleur du titre
      },
    },
    colors: ['#1E90FF'],
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: '#e7e7e7',
      strokeDashArray: 5,
    },
    tooltip: {
      enabled: true,
    },
  };

  const series = [
    {
      name: 'Ventes',
      data: data, 
    },
  ];

  return <Chart options={options} series={series} type="area" height="400" />;
};

export default LineChart;
