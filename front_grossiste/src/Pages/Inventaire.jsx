import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Styles/Inventaire.css';
import Sidebar from '../Components/SidebarMagasinier';
import Header from '../Components/NavbarM';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

function VisualiserInventaires() {
  const [inventaires, setInventaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userid");
  const nom = localStorage.getItem("nom");
  // Récupération des inventaires
  useEffect(() => {
    const fetchInventaires = async () => {
      try {
        const response = await axios.get(`https://api.bazariko.duckdns.org/api/inventaire/recuperer/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data); 
        setInventaires(response.data);
      } catch (error) {
        toast.error('Erreur lors du chargement des inventaires.');
        console.error(error);
        setError('Erreur lors du chargement des inventaires.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventaires();
  }, [token, userId]);

  return (
    <>
      <ToastContainer />
      <main className='center'>
        <Sidebar />
        <section className='contenue'>
          <Header />
          <div className="mini-stat p-3 content">
            <h5 className='alert alert-success'>
              <i className='fa fa-list'></i> Visualiser les Inventaires effectuer par {nom}
            </h5>
            <Link to="/creerinventaire" className="btn btn-primary">
            Effectuer un inventaire
            </Link>

            {loading ? (
              <p>Chargement des inventaires...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
                <div className="table-container" style={{ overflowX: 'auto',overflowY:'auto' }}>
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                  
                    <th>Produit</th>
                    <th>Quantité Initiale</th>
                    <th>Quantité Finale</th>
                    <th>Raison d'Ajustement</th>
                    <th>Date de Création</th>
                  </tr>
                </thead>
                <tbody>
  {inventaires.map((inventaire) => (
    <tr key={inventaire._id}>
    
      <td>{inventaire.produit.nom}</td> {/* Affichez le nom du produit ici */}
      <td>{inventaire.quantitéInitiale}</td>
      <td>{inventaire.quantitéFinale}</td>
      <td>{inventaire.raisonAjustement}</td>
      <td>{new Date(inventaire.dateInventaire).toLocaleDateString()}</td>
    </tr>
  ))}
</tbody>

              </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default VisualiserInventaires;
