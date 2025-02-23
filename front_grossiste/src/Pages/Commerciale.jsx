import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Importer SweetAlert
import "../Styles/Commerciale.css";
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';
import Modal from '../Components/Modal';

const GestionCommerciaux = () => {
  const [commerciaux, setCommerciaux] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [ventesDetails, setVentesDetails] = useState([]);

  const [commercialNom, setCommercialNom] = useState('');
  useEffect(() => {
    const fetchCommerciauxAvecVentes = async () => {
      try {
        const response = await axios.get('http://10.152.183.99/api/comercial/');
        setCommerciaux(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des commerciaux :", error);
      }
    };

    fetchCommerciauxAvecVentes();
  }, []);

  const handleRowClick = async (commercialId, commercialNom) => {
    setCommercialNom(commercialNom); // Mettre à jour le nom du commercial sélectionné
    try {
      const response = await axios.get(`http://10.152.183.99/api/paiementCom/performance/commercial/${commercialId}`);
      
      // Vérifiez si la réponse contient des ventes
      if (Array.isArray(response.data) && response.data.length === 0) {
        Swal.fire({
          title: 'Aucune Vente',
          text: `Le commercial ${commercialNom} n'a pas encore effectué de ventes.`,
          icon: 'info',
          confirmButtonText: 'OK'
        });
      } else {
        setVentesDetails(response.data);
        setModalOpen(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Swal.fire({
          title: 'Aucune Vente',
          text: `Aucune performance trouvée pour le commercial ${commercialNom}.`,
          icon: 'info',
          confirmButtonText: 'OK'
        }).then(() => {
          // Reload la page après avoir cliqué sur OK
          window.location.reload();
        });
      } else {
        console.error("Erreur lors de la récupération des ventes :", error);
      }
    }
  };

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="gestion-commerciaux">
          <h2>Gestion des Commerciaux</h2>
          <div className="table-container" style={{ overflowX: 'auto',overflowY:'auto' }}>
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
              <tr key={commercial._id} onClick={() => handleRowClick(commercial._id, commercial.nom)} style={{ cursor: 'pointer' }}>
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
          </div>
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} ventes={ventesDetails} commercialNom={commercialNom}  />
        </div>
      </section>
    </main>
  );
};

export default GestionCommerciaux;
