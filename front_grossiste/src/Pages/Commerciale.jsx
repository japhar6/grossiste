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
  const [commissionsDetails, setCommissionsDetails] = useState([]);
  const [commercialNom, setCommercialNom] = useState('');

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

  const handleRowClick = async (commercialId, commercialNom) => {
    setCommercialNom(commercialNom);
    try {
      const response = await axios.get(`http://localhost:5000/api/paiementCom/performance/commercial/${commercialId}`);
      const responseCommissions = await axios.get(`http://localhost:5000/api/commission/commercial/${commercialId}`);

      if (Array.isArray(response.data) && response.data.length === 0) {
        Swal.fire({
          title: 'Aucune Vente',
          text: `Le commercial ${commercialNom} n'a pas encore effectué de ventes.`,
          icon: 'info',
          confirmButtonText: 'OK'
        });
      } else {
        setVentesDetails(response.data);
        setCommissionsDetails(responseCommissions.data);
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
          window.location.reload();
        });
      } else {
        console.error("Erreur lors de la récupération des ventes :", error);
      }
    }
  };

  const handleAddCommission = async (commissionData) => {
    try {
      // Ajouter la logique pour envoyer la commission au backend
      const response = await axios.post('http://localhost:5000/api/commission/commissions/calculer', commissionData);
      
      // Mettre à jour l'état avec la nouvelle commission ajoutée
      setCommissionsDetails((prevCommissions) => [
        ...prevCommissions,
        response.data // Assurez-vous que le backend renvoie la commission ajoutée
      ]);
  
      Swal.fire('Succès', 'Commission ajoutée avec succès.', 'success');
    } catch (error) {
      console.error("Erreur lors de l'ajout de la commission :", error);
      Swal.fire('Erreur', 'Erreur lors de l\'ajout de la commission.', 'error');
    }
  };
  

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="gestion-commerciaux">
          <h6 className='alert alert-success'>Gestion des Commerciaux</h6>
          <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
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
          <Modal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
            ventes={ventesDetails} 
            commercialNom={commercialNom}  
            commissions={commissionsDetails} 
            onAddCommission={handleAddCommission}
          />
        </div>
      </section>
    </main>
  );
};

export default GestionCommerciaux;
