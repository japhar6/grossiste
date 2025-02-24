import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Swal from 'sweetalert2';
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
  const [filteredCommerciaux, setFilteredCommerciaux] = useState([]);
  const [filter, setFilter] = useState({
    nom: '',
    type: '',
    ventes: '',
    condition: 'greaterThanOrEqual', // Par défaut à "Supérieur ou égal"
  });
  

  useEffect(() => {
    const fetchCommerciauxAvecVentes = async () => {
      try {
        const response = await axios.get('/comercial/');
        setCommerciaux(response.data);
        setFilteredCommerciaux(response.data); // Initialiser le tableau filtré
      } catch (error) {
        console.error("Erreur lors de la récupération des commerciaux :", error);
      }
    };

    fetchCommerciauxAvecVentes();
  }, []);

  useEffect(() => {
    // Filtrer les commerciaux en fonction des critères
    const filtered = commerciaux.filter((commercial) => {
      return (
        (filter.nom ? commercial.nom.toLowerCase().includes(filter.nom.toLowerCase()) : true) &&
        (filter.type ? commercial.type === filter.type : true) &&
        (filter.ventes
          ? filter.condition === 'greaterThanOrEqual'
            ? commercial.ventes.length >= Number(filter.ventes)
            : commercial.ventes.length === Number(filter.ventes)
          : true)
      );
    });
    setFilteredCommerciaux(filtered);
  }, [filter, commerciaux]);

  const handleRowClick = async (commercialId, commercialNom) => {
    setCommercialNom(commercialNom);
    
    try {
        const response = await axios.get(`/paiementCom/performance/commercial/${commercialId}`);
        
        // Vérifiez si des ventes sont présentes
        if (Array.isArray(response.data) && response.data.length === 0) {
            Swal.fire({
                title: 'Aucune Vente',
                text: `Le commercial ${commercialNom} n'a pas encore effectué de ventes.`,
                icon: 'info',
                confirmButtonText: 'OK'
            });
        }

        setVentesDetails(response.data);
        setModalOpen(true); // Ouvre le modal même s'il n'y a pas de vente

        // Récupérez les commissions
        try {
            const responseCommissions = await axios.get(`/commission/commercial/${commercialId}`);
            if (responseCommissions.data && Array.isArray(responseCommissions.data)) {
                setCommissionsDetails(responseCommissions.data); // Met à jour uniquement si des commissions sont trouvées
            } else {
                setCommissionsDetails([]); // Aucune commission trouvée, videz l'état des commissions
            }
        } catch (commissionError) {
            console.error(`Erreur lors de la récupération des commissions pour le commercial ID: ${commercialId}`, commissionError);
            setCommissionsDetails([]); // Aucune commission trouvée, videz l'état des commissions
        }
    } catch (error) {
        console.error(`Erreur lors de la récupération des données pour le commercial ID: ${commercialId}`, error);
        Swal.fire({
            title: 'Erreur',
            text: error.response ? error.response.data.message : error.message || "Une erreur s'est produite lors de la récupération des données.",
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }
};



  const handleAddCommission = async (commissionData) => {
    try {
      await axios.post('/commission/commissions/calculer', commissionData);
      Swal.fire('Succès', 'Commission ajoutée avec succès', 'success');
      setModalOpen(false);
    } catch (error) {
      Swal.fire('Erreur', 'Échec de l\'ajout de la commission', 'error');
    }
  };

  // Extraire les types uniques
  const uniqueTypes = [...new Set(commerciaux.map(commercial => commercial.type))];

  return (
    <main className="center">
      <Sidebar />
      <section className="contenue">
        <Header />
        <div className="gestion-commerciaux">
          <h6 className='alert alert-success'>Gestion des Commerciaux</h6>
          <div className="filter-container mb-3">
  <input 
    type="text" 
    className="form-control me-2" 
    placeholder="Filtrer par nom" 
    value={filter.nom} 
    onChange={(e) => setFilter({ ...filter, nom: e.target.value })} 
  />
  <select 
    className="form-select me-2" 
    onChange={(e) => setFilter({ ...filter, type: e.target.value })}
  >
    <option value="">Tous les types</option>
    {uniqueTypes.map((type, index) => (
      <option key={index} value={type}>{type}</option>
    ))}
  </select>
  <input 
    type="number" 
    className="form-control me-2" 
    placeholder="Filtrer par ventes supérieures à" 
    value={filter.ventes} 
    onChange={(e) => setFilter({ ...filter, ventes: e.target.value })} 
  />
</div>

          <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
            <table className="table-striped">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th>Type</th>
                  <th>Date d'Inscription</th>
                  <th>Ventes Réalisées</th>
                </tr>
              </thead>
              <tbody>
  {filteredCommerciaux.length > 0 ? (
    filteredCommerciaux.map((commercial) => (
      <tr key={commercial._id} onClick={() => handleRowClick(commercial._id, commercial.nom)} style={{ cursor: 'pointer' }}>
        <td>{commercial.nom}</td>
        <td>{commercial.email}</td>
        <td>{commercial.telephone}</td>
        <td>{commercial.type}</td>
        <td>{commercial.statut}</td>
        <td>{new Date(commercial.dateInscription).toLocaleDateString()}</td>
        <td>{commercial.ventes ? commercial.ventes.length : 0}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" className="text-center">
        Aucun commercial trouvé.
      </td>
    </tr>
  )}
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
