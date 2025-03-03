import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import axios from '../api/axios'; // Assure-toi que axios est bien configuré

const LineChart = () => {
  const [periode, setPeriode] = useState('mensuel'); // Période par défaut
  const [date, setDate] = useState(''); // Date pour la recherche
  const [data, setData] = useState({ paiementsClassiques: [], paiementsCommerciaux: [] });
  const [categories, setCategories] = useState([]);

  // Fonction pour générer les jours d'un mois (en fonction du mois actuel)
  const generateDaysOfMonth = (month, year) => {
    const date = new Date(year, month, 0);
    const days = [];
    for (let i = 1; i <= date.getDate(); i++) {
      days.push(`Jour ${i}`);
    }
    return days;
  };

  // Fonction pour générer les mois de l'année
  const generateMonthsOfYear = () => {
    return [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
  };

  // Fonction pour générer les 10 dernières années
  const generateLast10Years = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      years.push(currentYear - (9 - i)); // Récupérer les 10 dernières années
    }
    return years;
  };

  // Fonction pour générer les heures par tranche de 2 heures pour la période journalière
  const generateHourlyData = () => {
    const hours = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const hour = new Date(currentDate.setHours(i * 2, 0, 0, 0));
      hours.push(`${hour.getHours()}:${hour.getMinutes() === 0 ? '00' : '30'}`);
    }
    return hours;
  };

  useEffect(() => {
    const fetchPaiementsData = async () => {
      try {
        let url = `/api/paiement/totals/${periode}`;
        if (date) {
          url += `?date=${date}`; // Ajouter la date à l'URL si elle est spécifiée
        }

        const response = await axios.get(url); // Appel à l'API avec la période et la date
        const { totalPaiements, totalPaiementsCommercial } = response.data;

        // Adapter les catégories en fonction de la période
        let paiementDataClassiques = [];
        let paiementDataCommerciaux = [];

        // Adapter selon la période (mensuelle, annuelle, etc.)
        if (periode === 'mensuel') {
          paiementDataClassiques = totalPaiements || [];
          paiementDataCommerciaux = totalPaiementsCommercial || [];
          setCategories(generateMonthsOfYear()); // Catégories pour le mois
        } else if (periode === 'annuel') {
          paiementDataClassiques = totalPaiements || [];
          paiementDataCommerciaux = totalPaiementsCommercial || [];
          setCategories(generateLast10Years()); // Catégories pour les 10 dernières années
        } else if (periode === 'journalier') {
          const hourlyData = generateHourlyData(); // Récupérer les heures par tranche de 2 heures
          paiementDataClassiques = new Array(hourlyData.length).fill(totalPaiements || 0);
          paiementDataCommerciaux = new Array(hourlyData.length).fill(totalPaiementsCommercial || 0);
          setCategories(hourlyData); // Catégories pour les heures du jour
        } else if (periode === 'hebdomadaire') {
          paiementDataClassiques = [totalPaiements, totalPaiements + 1000, totalPaiements + 2000, totalPaiements + 1500];
          paiementDataCommerciaux = [totalPaiementsCommercial, totalPaiementsCommercial + 700, totalPaiementsCommercial + 1500, totalPaiementsCommercial + 1200];
          setCategories(['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']); // Catégories pour les jours de la semaine
        }

        // Mettre à jour les catégories et les données
        setData({
          paiementsClassiques: Array.isArray(paiementDataClassiques) ? paiementDataClassiques : [],
          paiementsCommerciaux: Array.isArray(paiementDataCommerciaux) ? paiementDataCommerciaux : [],
        });

      } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
      }
    };

    fetchPaiementsData();
  }, [periode, date]); // Mettre à jour quand la période ou la date change

  const options = {
    chart: {
      id: 'line-chart',
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: categories.length ? categories : ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'], // Catégories des X (mois ou jours selon la période)
    },
    yaxis: {
      tickAmount: 6, // Ajuste le nombre de ticks sur l'axe des ordonnées
      min: 0, // Valeur minimale
    },
    stroke: {
      curve: 'smooth',
    },
    title: {
      text: `Performance des paiements (${periode})`, // Afficher la période dans le titre
      align: 'center',
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
      },
    },
    colors: ['#1E90FF', '#FF6347'], // Ajout de couleurs pour les paiements classiques et commerciaux
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
      name: 'Paiements Classiques',
      data: data.paiementsClassiques,
    },
    {
      name: 'Paiements Commerciaux',
      data: data.paiementsCommerciaux,
    },
  ];

  // Fonction pour changer la période
  const handleChangePeriode = (event) => {
    setPeriode(event.target.value);
  };

  // Fonction pour gérer la date
  const handleChangeDate = (event) => {
    setDate(event.target.value);
  };

  return (
    <div>
      <div className="center">
        <select value={periode} onChange={handleChangePeriode} className="form-control m-3">
          <option value="journalier">Journalier</option>
          <option value="hebdomadaire">Hebdomadaire</option>
          <option value="mensuel">Mensuel</option>
          <option value="annuel">Annuel</option>
        </select>
        <input type="date" value={date} onChange={handleChangeDate} className="form-control m-3" />
      </div>
      <Chart options={options} series={series} type="area" height="400" />
    </div>
  );
};

export default LineChart;
