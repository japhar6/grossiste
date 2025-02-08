import 'react';
import Chart from 'react-apexcharts';

const DonutChart = () => {
  const options = {
    chart: {
      type: 'donut',
      toolbar: {
        show: false, // Supprime la barre d'outils
      },
    },
    labels: ['Produit A', 'Produit B', 'Produit C', 'Produit D'], // Catégories statiques
    legend: {
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
    colors: ['#1E90FF', '#FFB6B6', '#98FB98', '#D8B2D1'], // Couleurs douces et distinctes
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'linear',
        shadeIntensity: 0.5,
        gradientToColors: ['#1E90FF', '#FFB6B6', '#98FB98', '#D8B2D1'], // Dégradé subtil entre ces couleurs
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

  const series = [40, 25, 20, 15]; // Données statiques en pourcentage

  return <Chart options={options} series={series} type="donut" height="400" />;
};

export default DonutChart;
