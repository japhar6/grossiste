import 'react';
import Chart from 'react-apexcharts';

const LineChart = () => {
  const options = {
    chart: {
      id: 'line-chart',
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'], // Données statiques pour les mois
    },
    stroke: {
      curve: 'smooth', // Courbes fluides
    },
    colors: ['#1E90FF'], // Couleur de la ligne
    dataLabels: {
      enabled: false, // Pas d'étiquettes sur les points
    },
    grid: {
      borderColor: '#e7e7e7',
      strokeDashArray: 5, // Grille légère
    },
    tooltip: {
      enabled: true, // Affiche les valeurs au survol
    },
  };

  const series = [
    {
      name: 'Ventes',
      data: [120, 150, 180, 200, 170, 220], // Données statiques pour les ventes
    },
  ];

  return <Chart options={options} series={series} type="area" height="400" />;
};

export default LineChart;
