import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import '../Styles/Inventaire.css';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function VisualiserInventaires() {
  const [inventaires, setInventaires] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtreProduit, setFiltreProduit] = useState("");
  const [filtreEntrepot, setFiltreEntrepot] = useState("");
  const [filtreRaison, setFiltreRaison] = useState("");
  const [filtreDate, setFiltreDate] = useState("");
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userid");
  const nom = localStorage.getItem("nom");

  // Récupération des entrepôts
  useEffect(() => {
    const fetchEntrepots = async () => {
      try {
        const response = await axios.get("/api/entrepot");
        const data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          setEntrepots(data);
        } else {
          Swal.fire({
            title: "Erreur",
            text: "Impossible de récupérer les entrepôts.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Erreur",
          text: "Une erreur est survenue lors de la récupération des entrepôts.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    };

    fetchEntrepots();
  }, []);

  // Récupération des inventaires
  useEffect(() => {
    const fetchInventaires = async () => {
      try {
        const response = await axios.get(`/api/inventaire/inventaires`, {
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

  // Filtrage des inventaires
  const filteredInventaires = inventaires.filter(inventaire => {
    const produitMatch = filtreProduit ? inventaire.produit.nom.toLowerCase().includes(filtreProduit.toLowerCase()) : true;
    const entrepotMatch = filtreEntrepot ? inventaire.entrepot.nom === filtreEntrepot : true;
    const raisonMatch = filtreRaison ? inventaire.raisonAjustement.toLowerCase().includes(filtreRaison.toLowerCase()) : true;
    const dateMatch = filtreDate ? new Date(inventaire.dateInventaire).toLocaleDateString() === new Date(filtreDate).toLocaleDateString() : true;

    return produitMatch && entrepotMatch && raisonMatch && dateMatch;
  });

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
            <div className="filters mb-4 d-flex justify-content-between align-items-center">
  <select className="form-select me-2" value={filtreEntrepot} onChange={e => setFiltreEntrepot(e.target.value)}>
    <option value="">Filtrer par entrepôt</option>
    {entrepots.map(entrepot => (
      <option key={entrepot._id} value={entrepot.nom}>{entrepot.nom}</option>
    ))}
  </select>
  <input
    type="text"
    className="form-control me-2"
    value={filtreProduit}
    onChange={e => setFiltreProduit(e.target.value)}
    placeholder="Filtrer par nom de produit"
  />
  <input
    type="text"
    className="form-control me-2"
    value={filtreRaison}
    onChange={e => setFiltreRaison(e.target.value)}
    placeholder="Filtrer par raison d'ajustement"
  />
  <input
    type="date"
    className="form-control me-2"
    value={filtreDate}
    onChange={e => setFiltreDate(e.target.value)}
  />
</div>

            {loading ? (
              <p>Chargement des inventaires...</p>
            ) : error ? (
              <p className="text-danger">{error}</p>
            ) : (
              <div className="table-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                    <th className="bg-success">Entrepot</th>
                      <th>Produit</th>
                      <th className="bg-success"> Quantité Initiale</th>
                      <th>Quantité Finale</th>
                      <th className="bg-success">Raison d'Ajustement</th>
                      <th>Date de Création</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventaires.map(inventaire => (
                      <tr key={inventaire._id}>
                        <td>{inventaire.entrepot.nom}</td> 
                        <td>{inventaire.produit.nom}</td> 
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
