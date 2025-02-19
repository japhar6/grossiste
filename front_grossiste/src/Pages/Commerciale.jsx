import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../Styles/Commerciale.css";
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';
import Modal from '../Components/Modal'; // Importer le modal

const GestionCommerciaux = () => {
  const [commerciaux, setCommerciaux] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [ventesDetails, setVentesDetails] = useState([]);

  useEffect(() => {
    const fetchCommerciauxAvecVentes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/comercial/');
        setCommerciaux(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des commerciaux :", error);
      }
    };

    fetchCommerciauxAvecVentes();
  }, []);

  const handleRowClick = async (commercialId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/paiementCom/performance/commercial/${commercialId}`);
      setVentesDetails(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Erreur lors de la récupération des ventes :", error);
    }
  };

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="gestion-commerciaux">
          <h2>Gestion des Commerciaux</h2>

          <table className="table-striped">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Date d'Inscription</th>
                <th>Ventes Réalisées</th>
              </tr>
            </thead>
            <tbody>
              {commerciaux.map((commercial) => (
                <tr key={commercial._id} onClick={() => handleRowClick(commercial._id)} style={{ cursor: 'pointer' }}>
                  <td>{commercial.nom}</td>
                  <td>{commercial.email}</td>
                  <td>{commercial.telephone}</td>
                  <td>{commercial.statut}</td>
                  <td>{new Date(commercial.dateInscription).toLocaleDateString()}</td>
                  <td>{commercial.ventes ? commercial.ventes.length : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} ventes={ventesDetails} />
        </div>
      </section>
    </main>
  );
};

export default GestionCommerciaux;
