import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../Styles/Commerciale.css";
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';

const GestionCommerciaux = () => {
  const [commerciaux, setCommerciaux] = useState([]);

  useEffect(() => {
    // Récupérer les données des commerciaux depuis l'API
    const fetchCommerciaux = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/comercial'); // Assure-toi que l'URL est correcte
        setCommerciaux(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des commerciaux :", error);
      }
    };

    fetchCommerciaux();
  }, []);

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="gestion-commerciaux">
          <h2>Gestion des Commerciaux</h2>

          {/* Tableau des commerciaux */}
          <table className="table-striped">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Date d'Inscription</th>
              </tr>
            </thead>
            <tbody>
              {commerciaux.map((commercial) => (
                <tr key={commercial._id}>
                  <td>{commercial.nom}</td>
                  <td>{commercial.email}</td>
                  <td>{commercial.telephone}</td>
                  <td>{commercial.statut}</td>
                  <td>{new Date(commercial.dateInscription).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default GestionCommerciaux;
