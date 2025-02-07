import 'react';
import Chart from 'react-apexcharts';

const DonutChart = () => {
  const options = {
    chart: {
      type: 'donut',
    },
    labels: ['Produit A', 'Produit B', 'Produit C', 'Produit D'], // Catégories statiques
    colors: ['#1E90FF', '#FF5733', '#28B463', '#FFC300'], // Couleurs pour chaque catégorie
    legend: {
      position: 'bottom',
    },
    tooltip: {
      enabled: true,
    },
  };

  const series = [40, 25, 20, 15]; // Données statiques en pourcentage

  return <Chart options={options} series={series} type="donut" height="400" />;
};

export default DonutChart;
